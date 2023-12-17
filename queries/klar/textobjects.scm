(function_definition body: (_) @function.inner @block.inner) @function.outer @block.outer
(impl_definition (impl_body) @class.inner @block.inner) @class.outer @block.outer
(trait_definition (trait_body) @class.inner @block.inner) @class.outer @block.outer
(enum_declaration (enum_body) @class.inner @block.inner) @class.outer @block.outer
(struct_declaration (struct_body) @class.inner @block.inner) @class.outer @block.outer
(extern_declaration (extern_body) @class.inner @block.inner) @class.outer @block.outer
(extern_impl (extern_impl_body) @class.inner @block.inner) @class.outer @block.outer
(parameter) @parameter
(match) @block.outer
(block
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "block.inner" @_start @_end)
  )
) @block.outer
(block
  "=>" (_) @block.inner
)
(if_block
  (":" . (_) @_start @_end _? @_end . "else"?
    (#make-range! "block.inner" @_start @_end)
  )
) @block.outer
(if_block
  "=>" (_) @block.inner
)
