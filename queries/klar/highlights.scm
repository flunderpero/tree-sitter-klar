(type_identifier) @type
((type_identifier) @exception (#eq? @exception "Error")) @exception
(other_identifier) @variable
(type) @type
(unit) @type
(comment) @comment
(int_literal) @number
(string_literal) @string
(char_literal) @character
(escape_sequence) @string.escape
(bool_literal) @boolean
(self) @variable.builtin
"fn" @keyword.function
"return" @keyword.return
[
    "let"
    "mut"
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
] @repeat

[
    "?"
    "!"
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
    ";"
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

(function_parameter
  name: (other_identifier) @parameter
)

(function_declaration
  name: (other_identifier) @function
  "throws" @exception
)

(function_definition
  [
    (block "=>" @keyword.function) 
    (block ":" @keyword.function) 
    (block "end" @keyword.function) 
  ]
)

(lambda_parameter
  name: (other_identifier) @parameter
)

(lambda_expression
  [
    (block "=>" @keyword.function) 
    (block ":" @keyword.function) 
    (block "end" @keyword.function) 
  ]
)


(struct_instantiation_expression (struct_field_assignment
  name: (other_identifier) @field
))

(struct_declaration
  [
    name: (type) @type.definition
    ":" @keyword
    "end" @keyword
  ]
)

(struct_field
  name: (_) @field
)

(enum_declaration
  [
    name: (type) @type.definition
    ":" @keyword
    "end" @keyword
  ]
)

(enum_variant_declaration
  name: (type_identifier) @type.definition
)


(trait_definition
  [
    name: (type) @type.definition
    ":" @keyword
    "end" @keyword
  ]
)

(impl_definition 
  [
    type: (type) @type
    for: (type) @type
    "for" @keyword
    ":" @keyword
    "end" @keyword
  ]
)

(extern_declaration
  "end" @keyword
)

(extern_impl_declaration
  [
    type: (type) @type
    for: (type) @type
    "for" @keyword
    ":" @keyword
    "end" @keyword
  ]
)

(for_statement
  [
    "for" @repeat
    "in" @repeat
    (loop_block "=>" @repeat) 
    (loop_block ":" @repeat) 
    (loop_block "end" @repeat) 
  ]
)

(while_statement
  [
    (loop_block "=>" @repeat) 
    (loop_block ":" @repeat) 
    (loop_block "end" @repeat) 
  ]
)

(loop_statement
  [
    (loop_block "=>" @repeat) 
    (loop_block ":" @repeat) 
    (loop_block "end" @repeat) 
  ]
)

(break_statement) @repeat

(continue_statement) @repeat

(if_expression
  [
    "=>" @conditional
    ":" @conditional
    (block "=>" @conditional)
    (block ":" @conditional)
    (block "end" @conditional)
  ]
)

(match_expression
  "end" @conditional
)

(match_arm
  [
    (block "=>" @conditional) 
    (block ":" @conditional) 
    (block "end" @conditional) 
  ]
)

(f_string_expression
  (f_string_interpolation
    "{" @punctuation.special
    "}" @punctuation.special
  ) @embedded
) @string

(field_expression
  field: (_) @field
)
 
(call_expression
  target: (other_identifier) @function
)

(call_expression
  target: (field_expression
    field: (_) @function
  )
)

(use_declaration
  [
    "as" @include
    "use" @include
  ]
)
