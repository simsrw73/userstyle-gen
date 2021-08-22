const rewire = require("rewire")
const css2userstyle = rewire("./css2userstyle")
const _padPropName = css2userstyle.__get__("_padPropName")
const formatUserJSHeader = css2userstyle.__get__("formatUserJSHeader")
const resolveMeta = css2userstyle.__get__("resolveMeta")
const _validateMatchURL = css2userstyle.__get__("_validateMatchURL")
const _userstyleMatchtoUserCSSMatch = css2userstyle.__get__("_userstyleMatchtoUserCSSMatch")
const _userstyleMatchtoUserJSMatch = css2userstyle.__get__("_userstyleMatchtoUserJSMatch")
const _getFirstPropOf = css2userstyle.__get__("_getFirstPropOf")
const _isAllowedCSSMetaProp = css2userstyle.__get__("_isAllowedCSSMetaProp")
const _isAllowedJSMetaProp = css2userstyle.__get__("_isAllowedJSMetaProp")
const _croak = css2userstyle.__get__("_croak")
// @ponicode
describe("_padPropName", () => {
    test("0", () => {
        let callFunction = () => {
            _padPropName({ length: 5 }, 1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _padPropName({ length: 1 }, 3)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _padPropName({ length: 10 }, 1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _padPropName({ length: 2 }, 0)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _padPropName({ length: 5 }, 3)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            _padPropName(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("formatUserJSHeader", () => {
    test("0", () => {
        let callFunction = () => {
            formatUserJSHeader("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            formatUserJSHeader(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("resolveMeta", () => {
    test("0", () => {
        let callFunction = () => {
            resolveMeta()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_validateMatchURL", () => {
    test("0", () => {
        let callFunction = () => {
            _validateMatchURL("DUMMYNAME", "url")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _validateMatchURL("dummyName", "url-prefix")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _validateMatchURL("dummyname", "array")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _validateMatchURL("dummyName", "string")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _validateMatchURL("dummyName", "regexp")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            _validateMatchURL(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_userstyleMatchtoUserCSSMatch", () => {
    test("0", () => {
        let callFunction = () => {
            _userstyleMatchtoUserCSSMatch("DUMMYNAME", "url")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _userstyleMatchtoUserCSSMatch("dummyName123", "domain")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _userstyleMatchtoUserCSSMatch("$dummy_name", "domain")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _userstyleMatchtoUserCSSMatch("dummyName123", "url-prefix")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _userstyleMatchtoUserCSSMatch("$dummy_name", "array")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            _userstyleMatchtoUserCSSMatch(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_userstyleMatchtoUserJSMatch", () => {
    test("0", () => {
        let callFunction = () => {
            _userstyleMatchtoUserJSMatch({ length: 10 }, "url")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _userstyleMatchtoUserJSMatch({ length: 3 }, "domain")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _userstyleMatchtoUserJSMatch({ length: 0 }, "domain")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _userstyleMatchtoUserJSMatch({ length: 0 }, "url")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _userstyleMatchtoUserJSMatch({ length: 1 }, "url-prefix")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            _userstyleMatchtoUserJSMatch({ length: NaN }, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_getFirstPropOf", () => {
    test("0", () => {
        let callFunction = () => {
            _getFirstPropOf("Corporate", "Legacy")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _getFirstPropOf("Corporate", "Future")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _getFirstPropOf("Corporate", "Corporate")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _getFirstPropOf("District", "Legacy")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _getFirstPropOf("District", "District")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            _getFirstPropOf(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_isAllowedCSSMetaProp", () => {
    test("0", () => {
        let callFunction = () => {
            _isAllowedCSSMetaProp("Corporate")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _isAllowedCSSMetaProp("Legacy")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _isAllowedCSSMetaProp("Future")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _isAllowedCSSMetaProp("District")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _isAllowedCSSMetaProp(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_isAllowedJSMetaProp", () => {
    test("0", () => {
        let callFunction = () => {
            _isAllowedJSMetaProp("Future")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _isAllowedJSMetaProp("Legacy")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _isAllowedJSMetaProp("Corporate")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _isAllowedJSMetaProp("District")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _isAllowedJSMetaProp(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_croak", () => {
    test("0", () => {
        let callFunction = () => {
            _croak("<error_message>%s</error_message>")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            _croak("Connection is closed")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            _croak("Error:")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            _croak("ValueError exception should be raised")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            _croak("No error")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            _croak(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
