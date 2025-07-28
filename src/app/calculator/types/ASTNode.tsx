export type ASTNode =
  | NumberLiteralNode
  | VariableNode
  | BinaryExpressionNode
  | FunctionCallNode;

export type NumberLiteralNode = {
  type: "NumberLiteral";
  value: number;
};
export type VariableNode = {
  type: "Variable";
  name: string;
};
export type BinaryExpressionNode = {
  type: "BinaryExpression";
  operator: "+" | "-" | "/" | "*" | "^";
  left: ASTNode;
  right: ASTNode;
};
export type FunctionCallNode = {
  type: "FunctionCall";
  name: string;
  argument: ASTNode;
};
