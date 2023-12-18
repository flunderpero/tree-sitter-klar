(function_definition body: (_) @function.inner @block.inner) @function.outer @block.outer
(impl_definition body: (_) @class.inner @block.inner) @class.outer @block.outer
(trait_definition body: (_) @class.inner @block.inner) @class.outer @block.outer
(enum_declaration variants: (_) @class.inner @block.inner) @class.outer @block.outer
(struct_declaration fields: (_) @class.inner @block.inner) @class.outer @block.outer
(extern_declaration declarations: (_) @class.inner @block.inner) @class.outer @block.outer
(extern_impl_declaration body: (_) @class.inner @block.inner) @class.outer @block.outer
(function_parameter) @parameter
(match_expression) @block.outer
(block
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "block.inner" @_start @_end)
  )
) @block.outer
(block
  "=>" (_) @block.inner
)
(loop_block
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "block.inner" @_start @_end)
  )
) @block.outer
(loop_block
  "=>" (_) @block.inner
)
(if_expression
  then_block: (":" . (_) @_start @_end _? @_end . "else"?
    (#make-range! "block.inner" @_start @_end)
  )
) @block.outer
(if_expression
  then_block: "=>" (_) @block.inner
)
