import peg from "pegjs";
import fs from "fs";
const grammar = fs.readFileSync("grammar.pegjs", "utf8");

function main() {
  try {
    var parser = peg.generate(grammar);

    const _program = `
    a=4; if(f){b(a); }   b=3; c();

    a(1, 2)
    g=true;
    h="dfgh#453543%^]&*(j";;
    function a (g, g, g){}

`;
    const program = `
    
    exp = r/6+5;

`;
    const result = parser.parse(program, {
      startRule: "program"
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log(error);
    // console.log(JSON.stringify(error, void 0, 2));
  }
}

main();
