import {
  ParserResult,
  Element,
  FunctionDeclaration,
  Declaration,
  Assignment,
  IfStatement,
  LoopStatement,
  FunctionCall,
  Type,
  Expression,
  SingleExpression,
  UnaryExpression,
  BinaryOperator,
} from "./expression-types";

export interface SymbolWithType {
  assignedType: Type;
}

export interface ProgramSymbol extends SymbolWithType {
  type: "function" | "paramDeclaration" | "declaration";
  assignedType: Type;
  paramsDeclaration?: SymbolWithType[];
}

export type SymbolTableType = { [key: string]: ProgramSymbol };

function validateNotDuplicate(symbolTable: SymbolTableType, symbol: string) {
  if (symbolTable[symbol]) throw new Error(`Duplicate identifier: "${symbol}"`);
}

function validateExists(symbolTable: SymbolTableType, symbol: string) {
  if (!symbolTable[symbol])
    throw new Error(`Identifier not found: "${symbol}"`);
  return symbolTable[symbol];
}

export function analyzeSemantics(program: ParserResult) {
  const symbolTable: SymbolTableType = {};
  program.forEach((element) => {
    analyzeSemanticsOfElement(element, symbolTable);
  });
}

function analyzeSemanticsOfElement(
  element: Element,
  parentSymbolTable: SymbolTableType
) {
  switch (element.type) {
    case "function": {
      analyzeSemanticsOfFunction(element, parentSymbolTable);
      break;
    }
    case "declaration": {
      analyzeSemanticsOfDeclaration(element, parentSymbolTable);
      break;
    }
    case "assignment": {
      analyzeSemanticsOfAssignment(element, parentSymbolTable);
      break;
    }
    case "if": {
      analyzeSemanticsOfIf(element, parentSymbolTable);
      break;
    }
    case "loop": {
      analyzeSemanticsOfLoop(element, parentSymbolTable);
      break;
    }
    case "functionCall": {
      analyzeSemanticsOfFunctionCall(element, parentSymbolTable);
      break;
    }
    default: {
      throw new Error("Unknown element");
      break;
    }
  }
}

function analyzeSemanticsOfFunction(
  element: FunctionDeclaration,
  parentSymbolTable: SymbolTableType
) {
  const elementName = element.identifier.identifier;
  validateNotDuplicate(parentSymbolTable, elementName);
  parentSymbolTable[elementName] = {
    type: element.type,
    assignedType: element.typeIdentifier,
    paramsDeclaration: element.paramsDeclaration.map((paramDeclaration) => ({
      assignedType: paramDeclaration.typeIdentifier,
    })),
  };
  //TODO: Validate return matches

  const localSymbolTable = { ...parentSymbolTable };
  element.paramsDeclaration.forEach((paramDeclaration) => {
    localSymbolTable[paramDeclaration.identifier.identifier] = {
      type: paramDeclaration.type,
      assignedType: paramDeclaration.typeIdentifier,
    };
  });
  element.block.forEach((statement) =>
    analyzeSemanticsOfElement(statement, localSymbolTable)
  );
}

function analyzeSemanticsOfDeclaration(
  element: Declaration,
  parentSymbolTable: SymbolTableType
) {
  const elementName = element.identifier.identifier;
  validateNotDuplicate(parentSymbolTable, elementName);
  parentSymbolTable[elementName] = {
    type: element.type,
    assignedType: element.typeIdentifier,
  };
  if (element.expression)
    analyzeSemanticsOfAssignment(
      {
        type: "assignment",
        expression: element.expression,
        identifier: element.identifier,
      },
      parentSymbolTable
    );
}

function analyzeSemanticsOfAssignment(
  element: Assignment,
  parentSymbolTable: SymbolTableType
) {
  const elementName = element.identifier.identifier;
  const symbol = validateExists(parentSymbolTable, elementName);
  const expressionReturnType = analyzeSemanticsOfExpression(
    element.expression,
    parentSymbolTable
  ).assignedType;
  if (expressionReturnType != symbol.assignedType) {
    throw new Error(
      `Type mismatch: ${elementName} is of type ${symbol.assignedType}, but is assigned a ${expressionReturnType}`
    );
  }
}

function analyzeSemanticsOfIf(
  element: IfStatement,
  parentSymbolTable: SymbolTableType
) {
  const expressionReturnType: Type = analyzeSemanticsOfExpression(
    element.expression,
    parentSymbolTable
  ).assignedType;
  if (!["boolean", "number"].includes(expressionReturnType)) {
    throw new Error("Invalid type for if statement expression");
  }
  const localSymbolTable = { ...parentSymbolTable };
  element.block.forEach((statement) =>
    analyzeSemanticsOfElement(statement, localSymbolTable)
  );
}

function analyzeSemanticsOfLoop(
  element: LoopStatement,
  parentSymbolTable: SymbolTableType
) {
  const expressionReturnType: Type = analyzeSemanticsOfExpression(
    element.expression,
    parentSymbolTable
  ).assignedType;
  if (!["boolean", "number"].includes(expressionReturnType)) {
    throw new Error("Invalid type for if statement expression");
  }
  const localSymbolTable = { ...parentSymbolTable };
  element.block.forEach((statement) =>
    analyzeSemanticsOfElement(statement, localSymbolTable)
  );
}

function analyzeSemanticsOfFunctionCall(
  element: FunctionCall,
  parentSymbolTable: SymbolTableType
) {
  const functionName = element.identifier.identifier;
  const functionSymbol = validateExists(parentSymbolTable, functionName);
  if (functionSymbol.type != "function") {
    throw new Error(`Cannot call ${functionName}: not a function`);
  }
  const functionExpectedParams = functionSymbol.paramsDeclaration?.length;
  const functionCallProvidedParams = element.params.length;
  if (functionExpectedParams != functionCallProvidedParams) {
    throw new Error(
      `Function ${functionName} expects ${functionExpectedParams} params but ${functionCallProvidedParams} were provided`
    );
  }
  element.params.forEach((param, i) => {
    const expressionReturnType = analyzeSemanticsOfExpression(
      param,
      parentSymbolTable
    ).assignedType;
    const expectedParamType =
      functionSymbol.paramsDeclaration?.[i].assignedType;
    if (expectedParamType != expressionReturnType) {
      throw new Error(
        `Param ${i} of ${functionName} expects type ${expectedParamType} params but ${expressionReturnType} was provided`
      );
    }
  });
}

function analyzeSemanticsOfExpression(
  element: Expression,
  parentSymbolTable: SymbolTableType
): SymbolWithType {
  const leftExpressionType = analyzeSemanticsOfSingleExpression(
    element.left,
    parentSymbolTable
  );
  if (!element.right) return leftExpressionType;
  else {
    const rightExpressionType = analyzeSemanticsOfSingleExpression(
      element.right,
      parentSymbolTable
    );
    const operator: BinaryOperator = <BinaryOperator>element.operator;
    if (["**", "*", "/", "%", "+", "-"].includes(operator)) {
      if (
        leftExpressionType.assignedType != rightExpressionType.assignedType ||
        leftExpressionType.assignedType != "number"
      ) {
        throw new Error("Cannot use arithmetic operator on non numeric values");
      } else {
        return leftExpressionType;
      }
    }

    if (["==", "!=", "<", ">", "<=", ">="].includes(operator)) {
      if (leftExpressionType.assignedType != rightExpressionType.assignedType) {
        throw new Error(
          "Cannot use arithmetic comparison operator on mismatching types"
        );
      } else {
        return { assignedType: Type.boolean };
      }
    }

    if (["&&", "||"].includes(operator)) {
      if (
        leftExpressionType.assignedType != rightExpressionType.assignedType ||
        leftExpressionType.assignedType != Type.boolean
      ) {
        throw new Error("Cannot use logical operator on non boolean values");
      } else {
        return { assignedType: Type.boolean };
      }
    }
  }
  return { assignedType: Type.unknown };
}

function analyzeSemanticsOfSingleExpression(
  element: SingleExpression,
  parentSymbolTable: SymbolTableType
): SymbolWithType {
  let expressionType: Type = Type.unknown;
  switch (element.type) {
    case "string": {
      expressionType = Type.string;
      break;
    }
    case "number": {
      expressionType = Type.number;
      break;
    }
    case "boolean": {
      expressionType = Type.boolean;
      break;
    }
    // case "null": {
    //   break;
    // }
    case "expression": {
      expressionType = analyzeSemanticsOfExpression(
        element,
        parentSymbolTable
      ).assignedType;
      break;
    }
    case "functionCall": {
      analyzeSemanticsOfFunctionCall(element, parentSymbolTable);
      break;
    }
    case "identifier": {
      expressionType = validateExists(
        parentSymbolTable,
        element.identifier
      ).assignedType;
      break;
    }
    case "unary": {
      expressionType = analyzeSemanticsOfUnaryExpression(
        element,
        parentSymbolTable
      ).assignedType;
      break;
    }

    default: {
      throw new Error("Unknown error");
      break;
    }
  }
  return { assignedType: expressionType };
}

function analyzeSemanticsOfUnaryExpression(
  element: UnaryExpression,
  parentSymbolTable: SymbolTableType
): SymbolWithType {
  const expressionType = analyzeSemanticsOfExpression(
    element.expression,
    parentSymbolTable
  ).assignedType;
  const operator = element.operator;
  if (["+", "-"].includes(operator)) {
    if (expressionType != "number")
      throw new Error(
        `Cannot apply operator ${operator} to expression of type ${expressionType}`
      );
    return { assignedType: Type.number };
  }
  if (["!"].includes(operator)) {
    if (expressionType != "boolean")
      throw new Error(
        `Cannot apply operator ${operator} to expression of type ${expressionType}`
      );
    return { assignedType: Type.number };
  }
  throw new Error("Unknown error");
}
