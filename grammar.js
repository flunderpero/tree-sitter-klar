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
        source_file: ($) => repeat($.declaration),

        declaration: ($) => choice($.function_declaration),

        function_declaration: ($) =>
            seq(
                "fn",
                field("name", $.identifier),
                $.parameters,
                optional(field("return_type", $.type)),
                field("body", $._block),
            ),

        parameters: ($) => seq("(", optional($._parameters), ")"),

        _parameters: ($) => seq(comma_sep($.parameter)),

        parameter: ($) => seq(field("name", $.identifier), field("type", $.type)),

        type: ($) => choice("bool", "i32", "str", "void"),

        _block: ($) =>
            choice($.single_expression_block, $.multi_expression_block),

        multi_expression_block: ($) => seq(":", repeat($._statement_or_expression), "end"),

        single_expression_block: ($) => seq("=>", $._expression),

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

        _if_block: ($) =>
            choice($.single_expression_block, seq($.multi_expression_block)),

        _statement: ($) => choice($.return, $.let, $.break, $.continue),

        _statement_or_expression: ($) => choice($._statement, $._expression),

        return: ($) => prec.left(seq("return", optional($._expression))),

        break: ($) => seq("break"),

        continue: ($) => seq("continue"),

        let: ($) =>
            seq(
                "let",
                field("name", $.identifier),
                "=",
                field("value", $._expression),
            ),

        member: ($) =>
            seq(
                field("variable", $.identifier),
                ".",
                field("member", repeat(seq(".", $.identifier))),
            ),

        function_call: ($) =>
            seq(field("name", $.identifier), $.function_call_args),

        function_call_args: ($) => seq("(", optional($._function_call_args), ")"),

        _function_call_args: ($) => seq(comma_sep($._expression)),

        parameter: ($) => seq(field("name", $.identifier), field("type", $.type)),

        _expression: ($) =>
            choice(
                $.function_call,
                $.identifier,
                $.member,
                $.binary,
                $.unary,
                $.int,
                $.string,
                $.bool,
                $.if_then_else,
                $.yield,
                $.loop,
                $.for,
                $.while,
            ),

        bool: ($) => choice("true", "false"),

        yield: ($) => seq("yield", $._expression),

        loop: ($) => seq("loop", field("body", $._block)),

        for: ($) =>
            seq(
                "for",
                field("variable", $.identifier),
                field("in", "in"),
                field("iterator", $._expression),
                field("body", $._block),
            ),

        while: ($) =>
            seq("while", field("condition", $._expression), field("body", $._block)),

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

        identifier: ($) => /[a-zA-Z][a-zA-Z0-9_]*/,

        int: ($) => /\d+/,

        string: ($) => /"[^"]*"/,

        comment: ($) =>
            token(choice(
                seq(
                    field("start", alias("--", "comment_start")),
                    field("content", alias(/.*/, "comment_content")),
                ),
                seq(
                    field("start", alias("---", "comment_start")),
                    field("content", alias(repeat(choice(/.|\n|\r/)), "comment_content")),
                    field("end", alias("---", "comment_end")),
                ),
            )),
    },
});

function comma_sep(rule) {
    return seq(rule, repeat(seq(",", rule)));
}
