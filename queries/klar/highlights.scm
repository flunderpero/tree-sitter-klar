(identifier) @variable
(type_identifier) @type
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
    "extern"
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
    "<"
    ">"
] @punctuation.bracket

[
    "{"
    "}"
] @punctuation.braces

(parameter
  name: (identifier) @parameter
)

(function_declaration
  name: (identifier) @function
)

(function_definition
  [
    (single_block "=>" @keyword.function) 
    ((multi_block ":" @keyword.function) "end" @keyword.function)
  ]
)

(closure_parameter
  name: (identifier) @parameter
)

(closure
  [
    (single_block "=>" @keyword.function) 
    ((multi_block ":" @keyword.function) "end" @keyword.function)
  ]
)

(parameter (identifier) @variable.parameter @parameter)

(field_access 
  field: (identifier) @field
)

(struct_instantiation (struct_field_assignment
  name: (identifier) @field
))

(struct_declaration
  name: (identifier) @type.definition
  ":" @keyword
)

(enum_declaration
  name: (identifier) @type.definition
  ":" @keyword
)

(trait_definition
  name: (identifier) @type.definition
  ":" @keyword
)


(impl_definition
  name: (identifier) @type
  ":" @keyword
)

(impl_definition
  for: (identifier) @type
)

(impl_definition
  "for" @keyword
)

(enum_variant_declaration
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

