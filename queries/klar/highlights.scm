(identifier) @variable
(type_identifier) @type
(type) @type
(comment) @comment
(int) @number
(string) @string
(char) @character
(escape_sequence) @string.escape
(bool) @boolean
(self) @variable.builtin
"?" @keyword.operator
"fn" @keyword.function
"return" @keyword.return
[
    (let)
    (mut)
    "yield"
    "struct"
    "extern"
    "enum"
    "impl"
    "trait"
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
    "."
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
    (block "=>" @keyword.function) 
    (block ":" @keyword.function) 
    (block "end" @keyword.function) 
  ]
)

(closure_parameter
  name: (identifier) @parameter
)

(closure
  [
    (block "=>" @keyword.function) 
    (block ":" @keyword.function) 
    (block "end" @keyword.function) 
  ]
)

(parameter (identifier) @variable.parameter @parameter)

(struct_instantiation (struct_field_assignment
  name: (identifier) @field
))

(struct_declaration
  [
    name: (identifier) @type.definition
    ":" @keyword
    "end" @keyword
  ]
)

(enum_declaration
  [
    name: (identifier) @type.definition
    ":" @keyword
    "end" @keyword
  ]
)

(enum_variant_declaration
  name: (identifier) @type.definition
)


(trait_definition
  [
    name: (identifier) @type.definition
    ":" @keyword
    "end" @keyword
  ]
)

(impl_definition 
  [
    name: (identifier) @type
    for: (identifier) @type
    "for" @keyword
    ":" @keyword
    "end" @keyword
  ]
)

(extern_declaration
  "end" @keyword
)

(extern_impl
  [
    name: (identifier) @type
    for: (identifier) @type
    "for" @keyword
    ":" @keyword
    "end" @keyword
  ]
)


(for
  [
    "for" @repeat
    "in" @repeat
    (block "=>" @repeat) 
    (block ":" @repeat) 
    (block "end" @repeat) 
  ]
)

(while
  [
    (block "=>" @repeat) 
    (block ":" @repeat) 
    (block "end" @repeat) 
  ]
)

(loop
  [
    (block "=>" @repeat) 
    (block ":" @repeat) 
    (block "end" @repeat) 
  ]
)

(if_then_else
  [
    "end" @conditional
    (if_block "=>" @conditional)
    (if_block ":" @conditional)
    (else_block 
      [ 
        (block "=>" @conditional)
        (block ":" @conditional)
        (block "end" @conditional)
      ]
    )
  ]
)

(match
  "end" @conditional
)

(match_arm
  [
    (block "=>" @conditional) 
    (block ":" @conditional) 
    (block "end" @conditional) 
  ]
)

(interpolated_string) @string
 
(function_call
  name: (identifier) @function
)
