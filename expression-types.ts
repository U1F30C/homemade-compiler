export type ParserResult = Element[];
export type Element = Statement | FunctionDeclaration;

export class FunctionDeclaration {
  type: "function";
  identifier: Identifier;
  paramsDeclaration: ParamsDeclaration;
  typeIdentifier: Type;
  block: Block;
}

export type ParamsDeclaration = ParamDeclaration[];

export class ParamDeclaration {
  type: "paramDeclaration";
  identifier: Identifier;
  typeIdentifier: Type;
}

export type Statement =
  | Declaration
  | Assignment
  | IfStatement
  | LoopStatement
  | FunctionCall;

export class Assignment {
  type: "assignment";
  identifier: Identifier;
  expression: Expression;
}

export class Declaration {
  type: "declaration";
  identifier: Identifier;
  typeIdentifier: Type;
  expression?: Expression;
}

export enum Type {
  "string" = "string",
  "number" = "number",
  "boolean" = "boolean",
  "void" = "void",
  "unknown" = "unknown",
}

export class IfStatement {
  type: "if";
  expression: Expression;
  block: Block;
}

export class LoopStatement {
  type: "loop";
  expression: Expression;
  block: Block;
}

export class FunctionCall {
  type: "functionCall";
  identifier: Identifier;
  params: Params;
}

export type Params = Param[];

export class Expression {
  type: "expression";
  left: SingleExpression;
  operator?: BinaryOperator;
  right?: Expression;
}

export class UnaryExpression {
  type: "unary";
  operator: UnaryOperator;
  expression: Expression;
}

export type SingleExpression = PrimaryExpression | UnaryExpression;

export type PrimaryExpression =
  | Constant
  | Identifier
  | FunctionCall
  | Expression;

export type Constant =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "null"; value: null };

export type BinaryOperator =
  | "**"
  | "*"
  | "/"
  | "%"
  | "+"
  | "-"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "&&"
  | "||";

export type UnaryOperator = "+" | "-" | "!";

export class Param extends Expression {}

export class Identifier {
  type: "identifier";
  identifier: string;
}

export type Block = Statement[];
