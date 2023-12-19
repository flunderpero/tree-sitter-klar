(_
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "block.inner" @_start @_end)
  )
) @block.outer
(_ "=>" (_) @block.inner) @block.outer

(function_definition
  (block
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "function.inner" @_start @_end)
  ))
) @function.outer

(function_parameter) @parameter

(struct_declaration
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "class.inner" @_start @_end)
  )
) @class.outer

(enum_declaration
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "class.inner" @_start @_end)
  )
) @class.outer

(trait_definition
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "class.inner" @_start @_end)
  )
) @class.outer

(impl_definition
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "class.inner" @_start @_end)
  )
) @class.outer

(extern_declaration
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "class.inner" @_start @_end)
  )
) @class.outer

(extern_impl_declaration
  (":" . (_) @_start @_end _? @_end . "end"
    (#make-range! "class.inner" @_start @_end)
  )
) @class.outer
