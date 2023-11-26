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
};

module.exports = grammar({
    name: "klar",

    extras: ($) => [/[\n]/, /\s/, $.comment],

    word: ($) => $.identifier,

    rules: {
        source_file: ($) =>
            repeat(choice($.declaration_or_definition, $.extern_declaration)),

        declaration_or_definition: ($) =>
            choice(
                $.function_definition,
                $.struct_declaration,
                $.enum_declaration,
                $.impl_definition,
                $.trait_definition,
            ),

        struct_declaration: ($) =>
            seq(
                "struct",
                field("name", $._identifier),
                optional($.type_parameters),
                ":",
                optional($.struct_body),
                "end",
            ),

        struct_body: ($) => repeat1($.field),

        enum_declaration: ($) =>
            seq(
                "enum",
                field("name", $._identifier),
                optional($.type_parameters),
                ":",
                $.enum_body,
                "end",
            ),

        enum_body: ($) => repeat1($.enum_variant_declaration),

        enum_variant_declaration: ($) =>
            seq(field("name", $._identifier), optional($.type_list)),

        impl_definition: ($) =>
            seq(
                "impl",
                field("name", $._identifier),
                optional($.type_parameters),
                optional(
                    seq("for", field("for", $._identifier), optional($.type_parameters)),
                ),
                ":",
                optional($.impl_body),
                "end",
            ),

        impl_body: ($) => repeat1($.function_definition),

        trait_definition: ($) =>
            seq(
                "trait",
                field("name", $._identifier),
                optional($.type_parameters),
                ":",
                optional($.trait_body),
                "end",
            ),

        trait_body: ($) =>
            repeat1(choice($.function_declaration, $.function_definition)),

        extern_declaration: ($) =>
            seq("extern", ":", optional($.extern_body), "end"),

        extern_body: ($) =>
            repeat1(
                choice($.function_declaration, $.struct_declaration, $.extern_impl),
            ),

        extern_impl: ($) =>
            seq(
                "impl",
                field("name", $._identifier),
                optional(seq("for", field("for", $._identifier))),
                ":",
                optional($.extern_impl_body),
                "end",
            ),

        extern_impl_body: ($) => repeat1($.function_declaration),

        function_declaration: ($) =>
            prec.right(
                seq(
                    "fn",
                    field("name", $._identifier),
                    optional($.type_parameters),
                    $.parameters,
                    optional(field("return_type", $.type)),
                ),
            ),

        function_definition: ($) =>
            seq($.function_declaration, field("body", $.block)),

        parameters: ($) => seq("(", optional($._parameters), ")"),

        _parameters: ($) =>
            comma_sep(choice($.self, seq(optional($.mut), $.parameter))),

        parameter: ($) => seq(field("name", $._identifier), field("type", $.type)),

        closure: ($) =>
            seq(
                "fn",
                "(",
                optional(comma_sep($.closure_parameter)),
                ")",
                optional(field("return_type", $.type)),
                $.block,
            ),

        closure_parameter: ($) =>
            seq(field("name", $._identifier), optional(field("type", $.type))),

        self: () => "self",

        mut: () => "mut",

        let: () => "let",

        struct_instantiation: ($) =>
            seq("{", optional(comma_sep($.struct_field_assignment)), "}"),

        struct_field_assignment: ($) =>
            seq(
                field("name", $._identifier),
                optional(seq(":", field("value", $._expression))),
            ),

        field: ($) => seq(field("name", $._identifier), field("type", $.type)),

        type: ($) =>
            prec.left(
                choice(
                    choice($._regular_type, $.array_type, $.function_type),
                    seq(
                        choice(
                            $._regular_type,
                            $.array_type,
                            seq("(", $.function_type, ")"),
                        ),
                        "?",
                    ),
                ),
            ),

        _regular_type: ($) =>
            prec.left(seq($.type_identifier, optional($.type_parameters))),

        array_type: ($) => seq("[", choice($._regular_type, $.array_type), "]"),

        type_parameters: ($) => seq("<", comma_sep($.type_identifier), ">"),

        function_type: ($) =>
            prec.right(
                seq(
                    "fn",
                    "(",
                    comma_sep($.type),
                    ")",
                    optional(field("return_type", $.type)),
                ),
            ),

        type_list: ($) => seq("(", optional($._type_list), ")"),

        _type_list: ($) => comma_sep(choice($.self, $.type)),

        block: ($) => choice($._single_block, seq($._multi_block, "end")),

        _multi_block: ($) => seq(":", repeat($._block_content)),

        _single_block: ($) => seq("=>", $._block_content),

        if_then_else: ($) =>
            seq(
                "if",
                field("condition", $._expression),
                $.if_block,
                choice($.else_block, "end"),
            ),

        if_block: ($) => choice($._single_block, $._multi_block),

        else_block: ($) => seq("else", $.block),

        _statement: ($) =>
            choice(
                $.return,
                $.variable_declaration,
                $.break,
                $.continue,
                $.declaration_or_definition,
            ),

        _block_content: ($) => choice($._statement, $._expression),

        return: ($) => prec.left(seq("return", optional($._expression))),

        break: () => seq("break"),

        continue: () => seq("continue"),

        variable_declaration: ($) =>
            prec.right(
                1,
                seq(
                    choice($.let, $.mut),
                    field("name", $._identifier),
                    optional(field("type", $.type)),
                    optional(seq("=", field("value", $._expression))),
                ),
            ),

        field_access: ($) =>
            prec.right(
                1,
                seq(
                    field("target", $._identifier),
                    dot_sep(
                        field(
                            "field",
                            choice($._identifier, $.function_call),
                        ),
                    ),
                ),
            ),

        function_call: ($) =>
            seq(field("name", $._identifier), $.function_call_args),

        function_call_args: ($) => seq("(", optional($._function_call_args), ")"),

        _function_call_args: ($) => seq(comma_sep($._expression)),

        parameter: ($) => seq(field("name", $._identifier), field("type", $.type)),

        array_literal: ($) => seq("[", optional(comma_sep($._literal)), "]"),

        _literal: ($) =>
            choice($.int, $.string, $.bool, $.array_literal, $.interpolated_string),

        _expression: ($) =>
            choice(
                $.binary,
                $.unary,
                $.match,
                $.function_call,
                $.field_access,
                $.struct_instantiation,
                $._literal,
                $._identifier,
                $.assignment,
                $.if_then_else,
                $.yield,
                $.loop,
                $.for,
                $.while,
                $.closure,
            ),

        bool: () => choice("true", "false"),

        yield: ($) => seq("yield", $._expression),

        assignment: ($) =>
            seq(
                field("variable", choice($.field_access, $._identifier)),
                "=",
                $._expression,
            ),

        loop: ($) => seq("loop", field("body", $.block)),

        for: ($) =>
            seq(
                "for",
                field("variable", $._identifier),
                "in",
                field("iterator", $._expression),
                field("body", $.block),
            ),

        while: ($) =>
            seq("while", field("condition", $._expression), field("body", $.block)),

        match: ($) =>
            seq(
                "match",
                field("expression", $._expression),
                ":",
                repeat($.match_arm),
                optional($.match_default_arm),
                "end",
            ),

        match_arm: ($) => seq(field("pattern", $._expression), $.block),

        match_default_arm: ($) => seq("else", $.block),

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
                                field("left", $._expression),
                                operator,
                                field("right", $._expression),
                            ),
                        ),
                    ),
                ),
            ),

        unary: ($) =>
            prec.left(
                PREC.UNARY,
                seq(field("operation", choice("not", "-")), $._expression),
            ),

        _identifier: ($) => choice($.type_identifier, $.identifier, $.self),

        identifier: ($) => /[a-z][a-zA-Z0-9_]*/,

        type_identifier: ($) =>
            choice(
                "bool",
                "str",
                "i8",
                "i16",
                "i32",
                "i64",
                "u8",
                "u16",
                "u32",
                "u64",
                "isize",
                "usize",
                /[A-Z][a-zA-Z0-9_]*/,
            ),

        int: () => /\d+/,

        string: ($) =>
            choice(
                // Single-line string
                seq(
                    '"',
                    repeat(choice($._string_content, $.escape_sequence)),
                    token.immediate('"'),
                ),
                // Multiline string
                seq(
                    '"""',
                    repeat(
                        choice(
                            $._multiline_string_content,
                            $.escape_sequence,
                            token.immediate('"'),
                            token.immediate('""'),
                        ),
                    ),
                    token.immediate('"""'),
                ),
            ),

        _string_content: (_) => token.immediate(prec(1, /[^"\n\\]+/)),

        _multiline_string_content: (_) => token.immediate(prec(1, /[^\\"]+/)),

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

        interpolated_string: ($) =>
            choice(
                // Single-line interpolated string
                seq(
                    'f"',
                    repeat(
                        choice(
                            $._interpolated_content,
                            $._expression_within_braces,
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
                            $._multiline_interpolated_content,
                            $._expression_within_braces,
                            $.escape_sequence,
                            token.immediate('"'),
                            token.immediate('""'),
                        ),
                    ),
                    token.immediate('"""'),
                ),
            ),

        _interpolated_content: (_) => token.immediate(prec(1, /[^"{\n\\]+/)),

        _multiline_interpolated_content: (_) =>
            token.immediate(prec(1, /[^"\\{]+/)),

        _expression_within_braces: ($) => seq("{", $._expression, "}"),

        comment: () =>
            token(
                choice(
                    seq(
                        field("start", alias("--", "comment_start")),
                        field("content", alias(/.*/, "comment_content")),
                    ),
                    seq(
                        field("start", alias("---", "comment_start")),
                        field(
                            "content",
                            alias(repeat(choice(/.|\n|\r/)), "comment_content"),
                        ),
                        field("end", alias("---", "comment_end")),
                    ),
                ),
            ),
    },
});

function comma_sep(rule) {
    return seq(rule, repeat(seq(",", rule)));
}

function dot_sep(rule) {
    return seq(repeat1(seq(".", rule)));
}

function repeat1(rule) {
    return seq(rule, repeat(rule));
}
