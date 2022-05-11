import {
  Assignment,
  Declaration,
  Element,
  Expression,
  FunctionCall,
  FunctionDeclaration,
  IfStatement,
  LoopStatement,
  ParserResult,
  Type,
} from "./expression-types";
import { SymbolTableType, SymbolWithType } from "./semantic-analyzer";

const llvmTypesMap: { [key in Type]: string } = {
  [Type.boolean]: "i1",
  [Type.number]: "f64",
  [Type.string]: "",
  [Type.unknown]: "",
  [Type.void]: "",
};

export function generateProgramCode(program: ParserResult) {
  const programElementsCode = program.map((element) =>
    generateProgramCodeOfElement(element, {})
  );
  return `
define i32 @main() { ; i32()*

    ${programElementsCode.join("\n\n\n")}

    ret i32 0
}

`;
}

function generateProgramCodeOfElement(
  element: Element,
  parentSymbolTable: SymbolTableType
): string {
  let elementProgramCode: string;
  switch (element.type) {
    case "function": {
      elementProgramCode = generateProgramCodeOfFunction(
        element,
        parentSymbolTable
      );
      break;
    }
    case "declaration": {
      elementProgramCode = generateProgramCodeOfDeclaration(
        element,
        parentSymbolTable
      );
      break;
    }
    case "assignment": {
      elementProgramCode = generateProgramCodeOfAssignment(
        element,
        parentSymbolTable
      );
      break;
    }
    case "if": {
      elementProgramCode = generateProgramCodeOfIf(element, parentSymbolTable);
      break;
    }
    case "loop": {
      elementProgramCode = generateProgramCodeOfLoop(
        element,
        parentSymbolTable
      );
      break;
    }
    case "functionCall": {
      elementProgramCode = generateProgramCodeOfFunctionCall(
        element,
        parentSymbolTable
      );
      break;
    }
  }
  return elementProgramCode;
}

function generateProgramCodeOfFunction(
  element: FunctionDeclaration,
  parentSymbolTable: SymbolTableType
): string {
  throw new Error("Function not implemented.");
}

function generateProgramCodeOfDeclaration(
  element: Declaration,
  parentSymbolTable: SymbolTableType
): string {
  return `
%${element.identifier.identifier} = alloca ${llvmTypesMap[element.typeIdentifier]}
store ${llvmTypesMap[element.typeIdentifier]} element.e, i32* %x, align 4
`
}

function generateProgramCodeOfAssignment(
  element: Assignment,
  parentSymbolTable: SymbolTableType
): string {

  return `%${element.identifier.identifier} = alloca ${llvmTypesMap[element.typeIdentifier]}\n`
    
}

function generateProgramCodeOfIf(
  element: IfStatement,
  parentSymbolTable: SymbolTableType
): string {
  throw new Error("Function not implemented.");
}

function generateProgramCodeOfLoop(
  element: LoopStatement,
  parentSymbolTable: SymbolTableType
): string {
  throw new Error("Function not implemented.");
}

function generateProgramCodeOfFunctionCall(
  element: FunctionCall,
  parentSymbolTable: SymbolTableType
): string {
  throw new Error("Function not implemented.");
}


function generateProgramCodeOfExpression(
    element: Expression & SymbolWithType,
    parentSymbolTable: SymbolTableType
  ): {code: string, resultVarName:string} {
    throw new Error("Function not implemented.");
  }
  