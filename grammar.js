const PREC = {
    OR: 3,
    AND: 4,
    COMPARE: 5,
    BIT_OR: 6,
    BIT_NOT: 7,
    BIT_AND: 8,
    BIT_XOR: 9,
    BIT_SHIFT: 10,
    PLUS_MINUS: 11,
    MUL_DIV_MOD: 12,
    UNARY: 13,
}

module.exports = grammar({
    name: "klar",

    extras: ($) => [/\s/, $.comment],

    rules: {
        // Entry point:

        source_file: ($) =>
            repeat(
                choice(
                    $.function_definition,
                    $.struct_declaration,
                    $.enum_declaration,
                    $.extern_declaration,
                    $.trait_definition,
                    $.impl_definition,
                ),
            ),

        // Declarations:

        struct_declaration: ($) =>
            seq(
                "struct",
                field("name", $.type),
                ":",
                field("fields", optional(repeat($.struct_field))),
                "end",
            ),

        struct_field: ($) => seq(field("name", $.other_identifier), field("type", $.type)),

        enum_declaration: ($) =>
            seq(
                "enum",
                field("name", $.type),
                ":",
                field("variants", optional(repeat($.enum_variant_declaration))),
                "end",
            ),

        enum_variant_declaration: ($) =>
            seq(
                field("name", $.type_identifier),
                optional(seq("(", field("fields", comma_sep($.type)), ")")),
            ),

        function_declaration: ($) =>
            seq(
                "fn",
                field("name", $.other_identifier),
                optional(field("type_parameters", $.type_parameters)),
                "(",
                field("parameters", optional(comma_sep($.function_parameter))),
                ")",
                field("return_type", optional(choice($.type, $.unit))),
            ),

        function_parameter: ($) =>
            seq(
                optional(field("mutable", "mut")),
                choice($.self, seq(field("name", $.other_identifier), field("type", $.type))),
            ),

        variable_declaration: ($) =>
            seq(
                choice("let", field("mutable", "mut")),
                field("name", $.other_identifier),
                optional(field("type", $.type)),
                "=",
                field("value", $.expression),
            ),

        extern_declaration: ($) =>
            seq(
                "extern",
                ":",
                field(
                    "declarations",
                    repeat(
                        choice(
                            $.function_declaration,
                            $.struct_declaration,
                            $.extern_impl_declaration,
                        ),
                    ),
                ),
                "end",
            ),

        extern_impl_declaration: ($) =>
            choice(
                seq(
                    "impl",
                    field("type", $.type),
                    ":",
                    field("body", optional(repeat($.function_declaration))),
                    "end",
                ),
                seq("impl", field("type", $.type), "for", field("for", $.type)),
            ),

        // Definitions:

        function_definition: ($) =>
            seq(field("declaration", $.function_declaration), field("body", $.block)),

        lambda_expression: ($) =>
            seq(
                "fn",
                optional(field("type_parameters", $.type_parameters)),
                "(",
                field("parameters", optional(comma_sep($.lambda_parameter))),
                ")",
                field("return_type", optional($.type)),
                field("body", $.block),
            ),

        lambda_parameter: ($) =>
            seq(
                optional(field("mutable", "mut")),
                field("name", $.other_identifier),
                field("type", optional($.type)),
            ),

        trait_definition: ($) =>
            seq(
                "trait",
                field("name", $.type),
                ":",
                field(
                    "body",
                    optional(repeat(choice($.function_declaration, $.function_definition))),
                ),
                "end",
            ),

        impl_definition: ($) =>
            seq(
                "impl",
                field("type", $.type),
                optional(seq("for", field("for", $.type))),
                ":",
                field("body", optional(repeat($.function_definition))),
                "end",
            ),

        block: ($) => choice(seq(":", repeat($._block_part), "end"), seq("=>", $._block_part)),

        _block_part: ($) =>
            choice(
                $.statement,
                $.expression,
                $.struct_declaration,
                $.enum_declaration,
                $.trait_definition,
                $.impl_definition,
                $.function_definition,
                $.variable_declaration,
            ),

        // Statements (excluding declarations):

        statement: ($) =>
            choice(
                $.assignment_statement,
                $.return_statement,
                $.loop_statement,
                $.for_statement,
                $.while_statement,
            ),

        assignment_statement: ($) =>
            prec.left(
                // Precedence must be higher than PREC.COMPARE to avoid ambiguity
                // with the `<` binary expression when using type parameters.
                6,
                seq(field("left", $.expression), "=", field("right", choice($.expression))),
            ),

        return_statement: ($) => 
            // We need right precedence (i.e. taking the longest match) to avoid ambiguity.
            prec.right(seq("return", optional(field("value", $.expression)))),

        loop_statement: ($) => seq("loop", field("body", $.loop_block)),

        for_statement: ($) =>
            seq(
                "for",
                field("name", $.other_identifier),
                "in",
                field("iterable", $.expression),
                field("body", $.loop_block),
            ),

        while_statement: ($) =>
            seq("while", field("condition", $.expression), field("body", $.loop_block)),

        loop_block: ($) =>
            choice(seq(":", repeat($._loop_block_part), "end"), seq("=>", $._loop_block_part)),

        _loop_block_part: ($) => choice($._block_part, $.break_statement, $.continue_statement),

        break_statement: ($) => "break",

        continue_statement: ($) => "continue",

        // Expressions:

        expression: ($) =>
            choice(
                $.int_literal,
                $.bool_literal,
                $.char_literal,
                $.string_literal,
                $.array_literal,
                $.tuple_literal,
                $.other_identifier,
                $.type_identifier,
                $.f_string_expression,
                $.field_access_expression,
                $.binary_expression,
                $.unary_expression,
                $.struct_instantiation_expression,
                $.lambda_expression,
                $.call_expression,
                $.if_expression,
                $.unit,
                $.match_expression,
            ),

        match_expression: ($) =>
            seq(
                "match",
                field("expression", $.expression),
                ":",
                field("arms", repeat($.match_arm)),
                "end",
            ),

        match_arm: ($) => seq(field("pattern", pipe_sep1($.pattern)), $.block),

        pattern: ($) =>
            choice(
                $.int_literal,
                $.bool_literal,
                $.char_literal,
                $.string_literal,
                $.array_pattern,
                $.tuple_pattern,
                $.other_identifier,
                $.enum_pattern,
                $.struct_pattern,
                $.range_pattern,
                $.wildcard_pattern,
            ),

        array_pattern: ($) => seq("[", field("elements", optional(comma_sep($.pattern))), "]"),

        tuple_pattern: ($) =>
            seq("(", field("elements", seq($.pattern, ",", optional(comma_sep($.pattern)))), ")"),

        range_pattern: ($) =>
            seq(
                field("start", $.range_pattern_literal),
                field("range_type", choice("..", "..<")),
                field("end", $.range_pattern_literal),
            ),

        range_pattern_literal: ($) => choice($.int_literal, $.char_literal),

        struct_pattern: ($) =>
            seq(
                field("type", $.type),
                "{",
                field("fields", optional(comma_sep($.struct_pattern_field))),
                "}",
            ),

        struct_pattern_field: ($) =>
            seq(field("name", $.other_identifier), optional(seq(":", field("value", $.pattern)))),

        enum_pattern: ($) =>
            prec.right(
                seq(
                    field("type", $.type),
                    optional(seq("(", field("fields", optional(comma_sep($.pattern))), ")")),
                ),
            ),

        wildcard_pattern: ($) => "_",

        if_expression: ($) =>
            prec.left(
                // Precedence must be higher than block to avoid ambiguity.
                1,
                seq(
                    "if",
                    field("condition", $.expression),
                    choice(
                        field("then_block", $.block),
                        seq(
                            field("then_block", seq(":", repeat($._block_part))),
                            "else",
                            field("else_block", $.block),
                        ),
                        seq(
                            field("then_block", seq("=>", $._block_part)),
                            "else",
                            field("else_block", $.block),
                        ),
                    ),
                ),
            ),

        struct_instantiation_expression: ($) =>
            seq(
                optional(field("type", $.type)),
                "{",
                field("parameters", optional(comma_sep($.struct_field_assignment))),
                "}",
            ),

        struct_field_assignment: ($) =>
            seq(
                field("name", $.other_identifier),
                optional(seq(":", field("value", $.expression))),
            ),

        call_expression: ($) =>
            prec.left(
                // Precedence must be higher to avoid ambiguity
                // with the `<` binary expression when using type parameters.
                4,
                seq(
                    field(
                        "target",
                        choice(
                            seq(
                                $.expression,
                                optional(field("type_parameters", $.type_parameters)),
                            ),
                            // Enum variants are also valid call targets.
                            $.type,
                        ),
                    ),
                    choice(token.immediate("()"), $.call_arguments),
                ),
            ),

        call_arguments: ($) => seq(token.immediate("("), comma_sep($.expression), ")"),

        field_access_expression: ($) =>
            prec.left(
                // Precedence must be higher to avoid ambiguity
                // with the `<` binary expression when using type parameters.
                5,
                seq(
                    field(
                        "target",
                        choice(
                            seq(
                                $.expression,
                                optional(field("type_parameters", $.type_parameters)),
                            ),
                            // Types like enums and structs can also be used in a field access.
                            $.type,
                        ),
                    ),
                    ".",
                    dot_sep1(field("field", $.field_access_field_expression)),
                ),
            ),

        field_access_field_expression: ($) =>
            prec.left(
                // Precedence must be higher to avoid ambiguity with `$.expression`.
                1,
                choice(
                    $.int_literal,
                    seq($.other_identifier, optional(field("type_parameters", $.type_parameters))),
                    $.call_expression,
                    $.type,
                ),
            ),

        f_string_expression: ($) =>
            choice(
                // Single-line interpolated string
                seq(
                    'f"',
                    repeat(
                        choice(
                            $._non_escaped_f_string_part,
                            $._f_string_expression,
                            $.escape_sequence,
                        ),
                    ),
                    token.immediate('"'),
                ),
                // Multiline interpolated string
                seq(
                    'f"""',
                    repeat(
                        choice(
                            $._non_escaped_multiline_f_string_part,
                            $._f_string_expression,
                            $.escape_sequence,
                            token.immediate('"'),
                            token.immediate('""'),
                        ),
                    ),
                    token.immediate('"""'),
                ),
            ),

        _non_escaped_f_string_part: (_) => token.immediate(prec(1, /[^"{\n\\]+/)),

        _non_escaped_multiline_f_string_part: (_) => token.immediate(prec(1, /[^"\\{]+/)),

        _f_string_expression: ($) => seq("{", $.expression, "}"),

        unary_expression: ($) =>
            prec.left(PREC.UNARY, seq("not", field("expression", $.expression))),

        binary_expression: ($) =>
            field(
                "operation",
                choice(
                    ...[
                        ["or", PREC.OR],
                        ["and", PREC.AND],
                        ["<", PREC.COMPARE],
                        ["<=", PREC.COMPARE],
                        ["==", PREC.COMPARE],
                        ["~=", PREC.COMPARE],
                        [">=", PREC.COMPARE],
                        [">", PREC.COMPARE],
                        ["|", PREC.BIT_OR],
                        ["~", PREC.BIT_NOT],
                        ["&", PREC.BIT_AND],
                        ["^", PREC.BIT_XOR],
                        ["<<", PREC.BIT_SHIFT],
                        [">>", PREC.BIT_SHIFT],
                        ["+", PREC.PLUS_MINUS],
                        ["-", PREC.PLUS_MINUS],
                        ["*", PREC.MUL_DIV_MOD],
                        ["/", PREC.MUL_DIV_MOD],
                        ["//", PREC.MUL_DIV_MOD],
                        ["%", PREC.MUL_DIV_MOD],
                    ].map(([operator, precedence]) =>
                        prec.left(
                            precedence,
                            seq(
                                field("left", $.expression),
                                operator,
                                field("right", $.expression),
                            ),
                        ),
                    ),
                ),
            ),

        // Literals:

        int_literal: ($) => token(choice(/0x[0-9a-fA-F]+/, /0b[01]+/, /0o[0-7]+/, /[0-9]+/)),

        array_literal: ($) => seq("[", field("elements", optional(comma_sep($.expression))), "]"),

        tuple_literal: ($) =>
            seq(
                "(",
                field("elements", seq($.expression, ",", optional(comma_sep($.expression)))),
                ")",
            ),

        char_literal: ($) =>
            seq("'", choice($._non_escaped_char, $.escape_sequence), token.immediate("'")),

        _non_escaped_char: (_) => token.immediate(prec(1, /[^\\']/)),

        bool_literal: ($) => choice("true", "false"),

        string_literal: ($) =>
            choice(
                // Single-line string
                seq(
                    '"',
                    repeat(choice($._non_escaped_string_part, $.escape_sequence)),
                    token.immediate('"'),
                ),
                // Multiline string
                seq(
                    '"""',
                    repeat(
                        choice(
                            $._non_escaped_multiline_string_part,
                            $.escape_sequence,
                            token.immediate('"'),
                            token.immediate('""'),
                        ),
                    ),
                    token.immediate('"""'),
                ),
            ),

        _non_escaped_string_part: (_) => token.immediate(prec(1, /[^"\n\\]+/)),

        _non_escaped_multiline_string_part: (_) => token.immediate(prec(1, /[^\\"]+/)),

        escape_sequence: (_) =>
            token.immediate(
                seq(
                    "\\",
                    choice(
                        /[^xuU]/,
                        /\d{2,3}/,
                        /x[0-9a-fA-F]{2,}/,
                        /u[0-9a-fA-F]{4}/,
                        /U[0-9a-fA-F]{8}/,
                    ),
                ),
            ),

        // Identifiers and types:

        other_identifier: ($) => /[a-z_][a-zA-Z0-9_]*/,

        type_identifier: ($) => /[A-Z][a-zA-Z0-9_]*/,

        type: ($) =>
            // We need to set a precedence to be able to use `$.type_identifier`
            // in `$.expression`.
            prec.left(
                1,
                seq(
                    choice(
                        seq($.type_identifier, optional($.type_parameters)),
                        $.builtin_type,
                        $.function_type,
                        $.array_type,
                    ),
                    optional("?"),
                ),
            ),

        unit: ($) => "()",

        self: ($) => "self",

        array_type: ($) => seq("[", field("type", $.type), "]"),

        function_type: ($) =>
            seq(
                "(",
                "fn",
                "(",
                field("parameters", optional(comma_sep($.type))),
                ")",
                field("return_type", optional($.type)),
                ")",
            ),

        builtin_type: ($) =>
            choice(
                "i8",
                "i16",
                "i32",
                "i64",
                "u8",
                "u16",
                "u32",
                "u64",
                "f32",
                "f64",
                "bool",
                "char",
                "str",
            ),

        type_parameters: ($) =>
            prec.left(
                // We need a higher precedence because otherwise `expression -> unit` clashes.
                1,
                seq("<", comma_sep(choice($.type, $.unit)), ">"),
            ),

        // Comments:

        comment: () =>
            token(
                choice(
                    // Single line comment.
                    seq("--", /.*/),
                    // Multi line comment.
                    seq("---", repeat(choice(/[^-]|\n|\r/, /-[^-]|--[^-]/)), "---"),
                ),
            ),
    },
})

function comma_sep(rule) {
    return seq(rule, repeat(seq(",", rule)))
}

function dot_sep1(rule) {
    return seq(rule, repeat(seq(".", rule)))
}

function pipe_sep1(rule) {
    return seq(rule, repeat(seq("|", rule)))
}
