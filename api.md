# @intlify/cli API References

## Table Of Contents

- [Function](#function)
  - [compile](#compile)
- [Enum](#enum)
  - [CompileErrorCodes](#compileerrorcodes)
- [Interface](#interface)
  - [CompileOptions](#compileoptions)

## Function

### compile

Compile i18n resources

**Signature:**
```typescript
export declare function compile(source: string, output: string, options?: CompileOptions): Promise<boolean>;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| source | string | the i18n resource source path, you can use glob pattern |
| output | string | the compiled i18n resource output path |
| options | CompileOptions | [CompileOptions](#compileoptions) |

#### Returns

 `true` when all i18n resource successfuly compile, not `false`

#### Remarks

This functoin is **asyncronous** function. If you want to get about error details, use the handler of [CompileOptions](#compileoptions) and [CompileErrorCodes](#compileerrorcodes)


## Enum

### CompileErrorCodes

Compile Error Codes

**Signature:**
```typescript
export declare const enum CompileErrorCodes 
```

#### Members

| Member | Value| Description |
| --- | --- | --- |
| INTERNAL_COMPILE_ERROR | 3 | Internal compile error |
| INTERNAL_COMPILE_WARNING | 2 | Internal compile warning |
| NOT_SUPPORTED_FORMAT | 1 | Not supported format |

#### Remarks

The error codes of [compile](#compile) function


## Interface

### CompileOptions

Compile Options

**Signature:**
```typescript
export interface CompileOptions 
```

#### Remarks

This optioins is used at [compile](#compile) function


#### Properties

##### mode

Compile mode

**Signature:**
```typescript
mode?: DevEnv;
```

#### Remarks

The mode of code generation. Default `production` for optimization. If `development`, code generated with meta information from i18n resources.

##### onCompile

Compile handler

**Signature:**
```typescript
onCompile?: (source: string, output: string) => void;
```

##### onError

Compile Error handler

**Signature:**
```typescript
onError?: (code: number, source: string, output: string, msg?: string) => void;
```



