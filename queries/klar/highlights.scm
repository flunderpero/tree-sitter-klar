(type) @type
(comment) @comment
(int) @number
(string) @string
(escape_sequence) @string.escape
(bool) @boolean
(self) @variable.builtin
"?" @keyword.operator
"fn" @keyword.function
"return" @keyword.return
[
    (let)
    (mut)
    "in"
    "yield"
    "struct"
    "enum"
    "impl"
    "trait"
    "end"
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
] @punctuation.paren

[
    "["
    "]"
] @punctuation.bracket

[
    "{"
    "}"
] @punctuation.braces

(ERROR) @error

(identifier) @variable

(match
  (match_arm
    pattern: (identifier) @type
  )
)

(parameter
  name: (identifier) @parameter
)

(function_signature
  name: (identifier) @function
)

(function_declaration
  [
    (single_block "=>" @keyword.function) 
    ((multi_block ":" @keyword.function) "end" @keyword.function)
  ]
)

(parameter (identifier) @variable.parameter @parameter)

(member 
  member:(identifier) @field
)

(struct_instantiation (struct_field_assignment
  name: (identifier) @field
))

(struct
  name: (identifier) @type.definition
  ":" @keyword
)

(enum
  name: (identifier) @type.definition
  ":" @keyword
)

(trait
  name: (identifier) @type.definition
  ":" @keyword
)


(impl
  name: (identifier) @type
  ":" @keyword
)

(impl
  for: (identifier) @type
)

(impl
  "for" @keyword
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

(interpolated_string) @string
 
(function_call
  name: (identifier) @function
)

