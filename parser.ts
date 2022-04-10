import peg from "pegjs";
import fs from "fs";
import { ParserResult } from "./expression-types";
import { analyzeSemantics } from "./semantic-analyzer";
const grammar = fs.readFileSync("grammar.pegjs", "utf8");

function main() {
  try {
    var parser = peg.generate(grammar);

    const program = `

    let a: number = unex + 44;


`;
    const result:ParserResult = parser.parse(program, {
      startRule: "program"
    });
    const semanticResult = analyzeSemantics(result);

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log(error);
    // console.log(JSON.stringify(error, void 0, 2));
  }
}

main();
