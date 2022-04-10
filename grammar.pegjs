{
    function flattenList(head, tail) {
        if(tail == "")
            return [head]
        return [head, ...(tail)]
    }
    
    function parseParams(head, tail) {
        if(tail == null)
            return [head]
        return [head, ...(tail)]
    }
}

program = elements:elements { return elements }

elements = __ head:element __ tail:elements __ { return flattenList(head, tail)}
    / ""

element = statement
    / function

statement = statement:declaration _ statementSeparator { return statement }
    / statement:assignment _ statementSeparator { return statement }
    / statement:ifStatement { return statement }
    / statement:loopStatement { return statement }
    / statement:functionCall { return statement }
    / "" __ statementSeparator { return "" }

declaration = assignment:assignment

assignment = identifier:identifier __ "=" __ expression:expression { return { type: "assignment", identifier, expression} }

expression = left:singleExpression __ right:_expression { return { left, ...right } }

_expression = operator:binaryOperator __ right:expression { return { operator, right } }
    / ""

singleExpression = primaryExpression
    / operator:unaryOperator __ expression:expression { return { type: "unary", operator, expression } }

primaryExpression = constant
    / identifier:identifier { return { type: "identifier", identifier } }
    / functionCall
    / "(" _ expression:expression _ ")" { return expression }

constant = value:string { return { type: "string", value } }
    / value:number { return { type: "number", value } }
    / value:boolean { return { type: "boolean", value } }
    / "null" { return { type: "null", value: null } }

number = decimal / integer

decimal = integerPart:(digit+) "." decimalPart:digit+ {
    return Number(integerPart.join("")+"."+decimalPart.join(""))
}
integer = integerPart:(digit+) { return Number(integerPart.join("")) }

digit = [0-9]

boolean = value:(true / false) { return value }

true = "true" { return true }

false = "false" { return false }

string = '"' chars:([^"] / ("\\" '"'))* '"' { return chars.join("") }

functionCall = identifier:identifier __ "(" __ params:params __ ")" { return { type: "functionCall", identifier, params } }

params = head:param __ "," __ tail:params { return parseParams(head, tail) }
    / head:param { return parseParams(head, null) }
    / "" { return [] }

param = expression

unaryOperator = "+" / "-" / "!"

binaryOperator = "**" / "*" / "/" / "%" / "+" / "-"
    / "==" / "!=" / "<" / ">" / "<=" / ">="
    / "&&" / "||"

ifStatement = "if" __ "(" __ expression:expression __ ")" __ block:block { return { type: "if", expression, block } }

loopStatement = "while" __ "(" __ expression:expression __ ")" __ block:block { return { type: "while", expression, block } }

function = "function" __ identifier:identifier __ "(" __ paramsDeclaration:paramsDeclaration __ ")" __ block { return { type: "function", identifier, paramsDeclaration } }

paramsDeclaration = head:paramDeclaration __ "," __ tail:paramsDeclaration { return parseParams(head, tail) }
    / head:paramDeclaration { return parseParams(head, null) }
    / "" { return [] }

paramDeclaration = identifier:identifier { return { type:"param", identifier } }

block = "{" __ statements:statements __ "}" { return statements }

statements = head:statement __ tail:statements { return flattenList(head, tail) }
    / ""

__ = [ \t\n\r]*
_ = [ \t]*


statementSeparator = [;\n\r]

identifier = head:(identifierAtom / "_") tail:(identifierAtom)* { return head + tail.join("") }
identifierAtom = characters:[A-Za-z0-9_]

