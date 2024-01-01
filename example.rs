// We use this to compare other grammars to ours.

use std::io::Write;

struct Test {
    a: i32,
    b: i32,
}

impl Test {
    fn new(a: i32, b: i32) -> Test {
        Test { a, b: b + 1 }
    }

    fn print(&self) {
        self.a.print();
        println!("{} {}", self.a, self.b);
    }
}

fn test(name: &str) -> Result<(), String> {
    println!("Hello, {}!", name);
    Ok(())
}

fn main() -> () {
    test()?;
    let a: i16; 
    (a + b).print();
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
    let f = [1, 2, 3, 4, 5];
    println!("{}", f[0]);
    return ()
}
