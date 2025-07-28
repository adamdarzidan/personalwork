"use client";
import { useState } from "react";
import styles from "./calculator.module.css";
import GraphContainer from "./components/graphcontainer/GraphContainer";
import {
  derivativeOrder,
  detectHorizontalAsymptote,
  evaluate,
  insertMultiplicationOperators,
  integrate,
  isFunctionComplete,
  parse,
  tokenize,
} from "./evaluator";
import { ASTNode } from "./types/ASTNode";

export default function Calculator() {
  const [func, setFunc] = useState("x^2 + 3x + 2");
  const [parsedFunction, setParsedFunction] = useState<ASTNode | null>(null);

  const onFunctionUpdate = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setFunc(value);

    try {
      const tokens = tokenize(insertMultiplicationOperators(value));
      const ast = parse(tokens);
      setParsedFunction(ast);
    } catch (err) {
      setParsedFunction(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.container_left}>
        <input type="text" value={func} onInput={(e) => onFunctionUpdate(e)} />
        {!func.includes("x") &&
          func.length != 0 &&
          isFunctionComplete(func) && (
            <h1>{evaluate(parsedFunction, { x: 1 })}</h1>
          )}
        <h3>Integral</h3>
        <h4>{parsedFunction !== null && integrate(parsedFunction, 1, 2)}</h4>
        <h3>Derivative</h3>
        <h4>
          {parsedFunction !== null && derivativeOrder(parsedFunction, 2, 1)}
        </h4>
        <h5>HA</h5>
        <h5>
          {parsedFunction !== null && detectHorizontalAsymptote(parsedFunction)}
        </h5>
      </div>
      <GraphContainer func={parsedFunction} />
    </div>
  );
}
