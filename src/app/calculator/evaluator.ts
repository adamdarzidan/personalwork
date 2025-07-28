import { ASTNode } from "./types/ASTNode";

type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: string }
  | { type: "paren"; value: "(" | ")" };

export function insertMultiplicationOperators(expr: string): string {
  // Step 1: Insert * between number and letter or (
  expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");

  // Step 2: Insert * between variable or ) and (
  expr = expr.replace(/([a-zA-Z\)])(\()/g, "$1*$2");

  // Step 3: Remove * between function names and ( (like sin*(x))
  expr = expr.replace(
    /(sin|cos|log|sqrt|tan|arcsin|arccos|arctan|ln`)\s*\*/g,
    "$1"
  );

  return expr;
}

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  for (let i = 0; i < expr.length; i++) {
    let currentChar = expr.charAt(i);
    if (currentChar === " ") {
      continue;
    }
    if (
      /\d/.test(currentChar) ||
      (currentChar === "." && /\d/.test(expr[i + 1]))
    ) {
      let num = currentChar;
      while (i + 1 < expr.length && /[\d.]/.test(expr[i + 1])) {
        num += expr[++i];
      }
      tokens.push({ type: "number", value: parseFloat(num) });
    } else if ("-*/+^".includes(currentChar)) {
      tokens.push({ type: "operator", value: currentChar });
    } else if (currentChar === "x") {
      tokens.push({ type: "identifier", value: currentChar });
    } else if (currentChar === "(" || currentChar === ")") {
      tokens.push({ type: "paren", value: currentChar });
    } else if (/[a-zA-Z]/.test(currentChar)) {
      let id = currentChar;
      while (i + 1 < expr.length && /[a-zA-Z]/.test(expr[i + 1])) {
        id += expr[++i];
      }
      tokens.push({ type: "identifier", value: id });
    } else {
      throw new Error("Not valid character " + currentChar);
    }
  }

  return tokens;
}

export function parse(tokens: Token[]): ASTNode {
  let current = 0;

  function parseExpression(): ASTNode {
    let node = parseTerm();

    while (current < tokens.length && isAddSubOperator(peek())) {
      const operator = (tokens[current++] as Token & { type: "operator" })
        .value as "+" | "-";
      const right = parseTerm();
      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  function parseTerm(): ASTNode {
    let node = parseFactor();

    while (current < tokens.length && isMulDivOperator(peek())) {
      const operator = (tokens[current++] as Token & { type: "operator" })
        .value as "*" | "/";
      const right = parseFactor();
      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  function parseFactor(): ASTNode {
    let node = parsePrimary();

    while (
      current < tokens.length &&
      peek().type === "operator" &&
      peek().value === "^"
    ) {
      current++;
      const right = parsePrimary();
      node = {
        type: "BinaryExpression",
        operator: "^",
        left: node,
        right,
      };
    }

    return node;
  }

  function parsePrimary(): ASTNode {
    const token = tokens[current];

    // Number
    if (token.type === "number") {
      current++;
      return { type: "NumberLiteral", value: token.value };
    }

    // Variable
    if (
      (token.type === "identifier" && tokens[current + 1]?.type !== "paren") ||
      tokens[current + 1]?.value === ")"
    ) {
      current++;
      return { type: "Variable", name: token.value };
    }

    // Function call like sin(x)
    if (token.type === "identifier" && tokens[current + 1]?.value === "(") {
      const name = token.value;
      current += 2; // skip name and (
      const arg = parseExpression();
      current++; // skip )
      return { type: "FunctionCall", name, argument: arg };
    }

    // Parentheses
    if (token.type === "paren" && token.value === "(") {
      current++; // skip (
      const expr = parseExpression();
      current++; // skip )
      return expr;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  function peek(): Token {
    return tokens[current];
  }

  function isAddSubOperator(token: Token): boolean {
    return (
      token.type === "operator" && (token.value === "+" || token.value === "-")
    );
  }

  function isMulDivOperator(token: Token): boolean {
    return (
      token.type === "operator" && (token.value === "*" || token.value === "/")
    );
  }

  return parseExpression();
}
export function evaluate(
  node: ASTNode | null,
  scope: { [variable: string]: number }
): number {
  switch (node?.type) {
    case "NumberLiteral":
      return node.value;

    case "Variable":
      return scope[node.name]; // e.g., scope = { x: 5 } → returns 5

    case "BinaryExpression": {
      const left = evaluate(node.left, scope);
      const right = evaluate(node.right, scope);

      switch (node.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "^":
          return left ** right;
        default:
          throw new Error(`Unknown operator ${node.operator}`);
      }
    }

    case "FunctionCall": {
      const arg = evaluate(node.argument, scope); // recursively evaluate argument
      const fn = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        ln: Math.log,
        log: Math.log10,
        arcsin: Math.asin,
        arccos: Math.acos,
        arctan: Math.atan,
      }[node.name];

      if (!fn) throw new Error(`Unknown function ${node.name}`);
      return fn(arg);
    }

    default:
      throw new Error(`Unknown node type: ${JSON.stringify(node)}`);
  }
}

export function isFunctionComplete(func: string): boolean {
  const openParens = (func.match(/\(/g) || []).length;
  const closeParens = (func.match(/\)/g) || []).length;
  const lastChar = func.trim().charAt(func.trim().length - 1);
  const endsWithOperator = /[+\-*/^]/.test(lastChar);

  if (openParens !== closeParens) return false;
  if (endsWithOperator) return false;

  return true;
}

export function integrate(node: ASTNode, x1: number, x2: number): number {
  let value = 0;
  let step = 0.001;
  for (let i = x1; i <= x2; i += step) {
    value +=
      ((evaluate(node, { x: i }) + evaluate(node, { x: i + step })) / 2) * step;
  }
  return value;
}

export function derivativeOrder(
  node: ASTNode | null,
  x: number,
  order: number
): number {
  const h = 1e-5;

  if (order === 0) {
    return evaluate(node, { x });
  }

  // Use central difference for better accuracy
  // Recursive formula: f⁽ⁿ⁾(x) ≈ [f⁽ⁿ⁻¹⁾(x + h) - f⁽ⁿ⁻¹⁾(x - h)] / (2h)
  function nthDerivative(n: number, x: number): number {
    if (n === 0) {
      return evaluate(node, { x });
    }
    const forward = nthDerivative(n - 1, x + h);
    const backward = nthDerivative(n - 1, x - h);
    return (forward - backward) / (2 * h);
  }

  // Optional: rounding to avoid floating-point noise
  const raw = nthDerivative(order, x);
  return Math.round(raw * 1e6) / 1e6;
}

export function detectHorizontalAsymptote(node: ASTNode): any {
  const y1 = evaluate(node, { x: 1e4 });
  const y2 = evaluate(node, { x: 1e5 });
  const tolerance = 0.01;
  if (Math.abs(y1 - y2) < tolerance) {
    return y2;
  } else {
    return "None"; //edit this later
  }
}
