(identifier) @variable

(parameter
  name: (identifier) @parameter
)

(function_declaration
  name: (identifier) @function
  [
    (single_block "=>" @keyword.function) 
    ((multi_block ":" @keyword.function) "end" @keyword.function)
  ]
)

(parameter (identifier) @variable.parameter @parameter)

(member 
  member:(identifier) @field
)

(struct
  name: (identifier) @type.definition
  "end" @keyword
)

(enum
  name: (identifier) @type.definition
  "end" @keyword
)

(enum_variant
  name: (identifier) @type.definition
)

(for
  [
    (single_block "=>" @repeat) 
    ((multi_block ":" @repeat) "end" @repeat)
  ]
)

(while
  [
    (single_block "=>" @repeat) 
    ((multi_block ":" @repeat) "end" @repeat)
  ]
)

(loop
  [
    (single_block "=>" @repeat) 
    ((multi_block ":" @repeat) "end" @repeat)
  ]
)

(if_then_else
  [
    (single_block "=>" @conditional) 
    ((multi_block ":" @conditional) "end" @conditional)
  ]
)

(match
  "end" @conditional
)

(match_arm
  [
    (single_block "=>" @conditional) 
    ((multi_block ":" @conditional) "end" @conditional)
  ]
)

(match_default_arm
  [
    (single_block "=>" @conditional) 
    ((multi_block ":" @conditional) "end" @conditional)
  ]
)

(format_string) @string
 
(function_call
  name: (identifier) @function
)

(type) @type
(comment) @comment
(int) @number
(string) @string
(escape_sequence) @string.escape
(bool) @boolean
"fn" @keyword.function
"return" @keyword.return
[
    "let"
    "in"
    "yield"
    "struct"
    "enum"
] @keyword

[
    "if"
    "else"
    "match"
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
