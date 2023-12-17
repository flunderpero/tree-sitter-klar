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
                field("variants", optional(repeat($.enum_variant))),
                "end",
            ),

        enum_variant: ($) =>
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
                field("return_type", optional($.type)),
            ),

        function_parameter: ($) =>
            seq(
                optional(field("mutable", "mut")),
                field("name", $.other_identifier),
                field("type", $.type),
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
            seq("extern", ":", repeat(choice($.function_declaration, $.struct_declaration)), "end"),

        // Definitions:

        function_definition: ($) =>
            seq(field("declaration", $.function_declaration), field("body", $.block)),

        lambda_definition: ($) =>
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

        block: ($) => choice(seq(":", repeat($._block_part), "end"), seq("=>", $._block_part)),

        _block_part: ($) =>
            choice(
                $.statement,
                $.expression,
                $.struct_declaration,
                $.function_definition,
                $.variable_declaration,
            ),

        // Statements (excluding declarations):

        statement: ($) => choice($.assignment_statement, $.return_statement),

        assignment_statement: ($) =>
            prec.left(
                // Precedence must be higher than PREC.COMPARE to avoid ambiguity
                // with the `<` binary expression when using type parameters.
                6,
                seq(field("left", $.expression), "=", field("right", choice($.expression))),
            ),

        return_statement: ($) => seq("return", field("value", $.expression)),

        // Expressions:

        expression: ($) =>
            choice(
                $.int_literal,
                $.char_literal,
                $.string_literal,
                $.array_literal,
                $.tuple_literal,
                $.f_string,
                $.other_identifier,
                $.field_access,
                $.type_identifier,
                $.binary,
                $.struct_instantiation,
                $.lambda_definition,
                $.call,
                $.if_expression,
            ),

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

        struct_instantiation: ($) =>
            seq(
                optional(field("type", $.type)),
                "{",
                field("parameters", optional(comma_sep($.struct_parameter))),
                "}",
            ),

        struct_parameter: ($) =>
            seq(
                field("name", $.other_identifier),
                optional(seq(":", field("value", $.expression))),
            ),

        call: ($) =>
            prec.left(
                // Precedence must be higher than PREC.COMPARE to avoid ambiguity
                // with the `<` binary expression when using type parameters.
                6,
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
                    "(",
                    field("arguments", optional(comma_sep($.expression))),
                    ")",
                ),
            ),

        field_access: ($) =>
            prec.left(
                // Precedence must be higher than PREC.COMPARE to avoid ambiguity
                // with the `<` binary expression when using type parameters.
                6,
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
                    dot_sep1(field("field", $.field_access_expression)),
                ),
            ),

        field_access_expression: ($) =>
            prec.left(
                6,
                choice(
                    $.int_literal,
                    seq($.other_identifier, optional(field("type_parameters", $.type_parameters))),
                    $.type,
                ),
            ),

        f_string: ($) =>
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

        binary: ($) =>
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

        type_parameters: ($) => seq("<", comma_sep($.type), ">"),

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
