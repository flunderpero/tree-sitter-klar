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
            repeat(choice($.declaration, $.impl, $.trait, $.extern)),

        declaration: ($) => choice($.function_declaration, $.struct, $.enum),

        impl: ($) =>
            seq(
                "impl",
                field("name", $._identifier),
                optional(seq("for", field("for", $._identifier))),
                ":",
                repeat($.function_declaration),
                "end",
            ),

        trait: ($) =>
            seq(
                "trait",
                field("name", $._identifier),
                ":",
                optional(repeat(choice($.function_signature, $.function_declaration))),
                "end",
            ),

        extern: ($) =>
            seq(
                "extern",
                ":",
                repeat(choice($.function_signature, $.struct, $.extern_impl)),
                "end",
            ),

        extern_impl: ($) =>
            seq(
                "impl",
                field("name", $._identifier),
                optional(seq("for", field("for", $._identifier))),
                ":",
                repeat($.function_signature),
                "end",
            ),

        function_signature: ($) =>
            prec.right(
                seq(
                    "fn",
                    field("name", $._identifier),
                    $.parameters,
                    optional(field("return_type", $.type)),
                ),
            ),

        function_declaration: ($) =>
            seq($.function_signature, field("body", $._block)),

        parameters: ($) => seq("(", optional($._parameters), ")"),

        _parameters: ($) =>
            comma_sep(choice($.self, seq(optional($.mut), $.parameter))),

        parameter: ($) => seq(field("name", $._identifier), field("type", $.type)),

        self: ($) => "self",

        mut: ($) => "mut",

        let: ($) => "let",

        struct: ($) =>
            seq("struct", field("name", $._identifier), ":", repeat($.field), "end"),

        struct_instantiation: ($) =>
            seq("{", optional(comma_sep($.struct_field_assignment)), "}"),

        struct_field_assignment: ($) =>
            seq(
                field("name", $._identifier),
                optional(seq(":", field("value", $._expression))),
            ),

        field: ($) => seq(field("name", $._identifier), field("type", $.type)),

        type: ($) =>
            choice(
                choice($.type_identifier, $.function_type, $._array_type),
                seq(
                    choice(
                        $.type_identifier,
                        seq("(", $.function_type, ")"),
                        $._array_type,
                    ),
                    "?",
                ),
            ),

        _type: ($) => choice($.type_identifier, $.function_type, $._array_type),

        _array_type: ($) => seq("[", $._type, "]"),

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

        enum: ($) =>
            seq(
                "enum",
                field("name", $._identifier),
                ":",
                repeat($.enum_variant),
                "end",
            ),

        enum_variant: ($) =>
            seq(field("name", $._identifier), optional($.type_list)),

        type_list: ($) => seq("(", optional($._type_list), ")"),

        _type_list: ($) => comma_sep(choice($.self, $.type)),

        _block: ($) => choice($.single_block, seq($.multi_block, "end")),

        multi_block: ($) => seq(":", repeat($._block_content)),

        single_block: ($) => seq("=>", $._block_content),

        if_then_else: ($) =>
            seq(
                "if",
                field("condition", $._expression),
                field("then_body", $._block),
                optional(seq("else", field("else_body", $._block))),
                "end",
            ),

        if_then_else: ($) =>
            seq(
                "if",
                field("condition", $._expression),
                field("then_body", $._if_block),
                choice(seq("else", field("else_body", $._block)), "end"),
            ),

        _if_block: ($) => choice($.single_block, $.multi_block),

        _statement: ($) =>
            choice(
                $.return,
                $.variable_declaration,
                $.break,
                $.continue,
                $.declaration,
            ),

        _block_content: ($) => choice($._statement, $._expression),

        return: ($) => prec.left(seq("return", optional($._expression))),

        break: ($) => seq("break"),

        continue: ($) => seq("continue"),

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

        member: ($) =>
            seq(field("variable", $._identifier), ".", field("member", $._member)),

        _member: ($) => choice($._identifier, $.member, $.function_call),

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
                $.member,
                $.struct_instantiation,
                $._literal,
                $._identifier,
                $.assignment,
                $.if_then_else,
                $.yield,
                $.loop,
                $.for,
                $.while,
            ),

        bool: ($) => choice("true", "false"),

        yield: ($) => seq("yield", $._expression),

        assignment: ($) =>
            seq(
                field("variable", choice($.member, $._identifier)),
                "=",
                $._expression,
            ),

        loop: ($) => seq("loop", field("body", $._block)),

        for: ($) =>
            seq(
                "for",
                field("variable", $._identifier),
                field("in", "in"),
                field("iterator", $._expression),
                field("body", $._block),
            ),

        while: ($) =>
            seq("while", field("condition", $._expression), field("body", $._block)),

        match: ($) =>
            seq(
                "match",
                field("expression", $._expression),
                ":",
                repeat($.match_arm),
                optional($.match_default_arm),
                "end",
            ),

        match_arm: ($) => seq(field("pattern", $._expression), $._block),

        match_default_arm: ($) => seq("else", $._block),

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

        int: ($) => /\d+/,

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

        comment: ($) =>
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
