(function_definition body: (_) @function.inner) @function.outer
(impl_definition (impl_body) @class.inner) @class.outer
(trait_definition (trait_body) @class.inner) @class.outer
(enum_declaration (enum_body) @class.inner) @class.outer
(struct_declaration (struct_body) @class.inner) @class.outer
(extern_declaration (extern_body) @class.inner) @class.outer
(extern_impl (extern_impl_body) @class.inner) @class.outer
(parameter) @parameter
(match) @block.outer
(block) @block.outer
