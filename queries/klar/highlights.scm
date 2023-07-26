(identifier) @parameter

(parameter
  name: (identifier) @parameter
)

(function_declaration
  name: (identifier) @function
  [
    (single_expression_block "=>" @keyword.function) 
    (multi_expression_block ":" @keyword.function "end" @keyword.function)
  ]
)

(for
  [
    (single_expression_block "=>" @repeat) 
    (multi_expression_block ":" @repeat "end" @repeat)
  ]
)

(while
  [
    (single_expression_block "=>" @repeat) 
    (multi_expression_block ":" @repeat "end" @repeat)
  ]
)

(loop
  [
    (single_expression_block "=>" @repeat) 
    (multi_expression_block ":" @repeat "end" @repeat)
  ]
)

(if_then_else
  "end" @conditional
)
 
(function_call
  name: (identifier) @function
)


(type) @type
(comment) @comment
(int) @number
(string) @string
(bool) @boolean
"fn" @keyword.function
"return" @keyword.return
[
    "let"
    "in"
    "yield"
] @keyword

[
    "if"
    "else"
] @conditional

[
    "for"
    "while"
    "loop"
    "break"
    "continue"
] @repeat

[
    "="
    "~="
    "=="
    "<="
    ">="
    "<"
    ">"
    "+"
    "-"
    "%"
    "/"
    "//"
    "*"
    "^"
    "&"
    "~"
    "|"
    ">>"
    "<<"
] @operator
    
[
    "and"
    "or"
    "not"
] @keyword.operator

[
    ","
] @punctuation.delimiter

[
    "("
    ")"
] @punctuation.bracket

(ERROR) @error
