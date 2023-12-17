// We use this to compare other grammars to ours.

struct Test {
    a: i32,
    b: i32,
}

impl Test {
    fn new(a: i32, b: i32) -> Test {
        Test { a, b: b + 1 }
    }

    fn print(&self) {
        println!("{} {}", self.a, self.b);
    }
}

fn test(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    let a: i16; 
    let t = Test { a: 1, b: 2 };
    println!("{} {}", t.a, t.b);
    for i in 0..10 {
        println!("{}", i);
    }
    match 1 {
        1 | 2 => {
            console.log("1");
        }
        Test{a: var_a, b: _} => {
            console.log("2");
        }
        2 => {
            console.log("2");
        }
    }
}