# @intlify/cli API References

## Table Of Contents

- [Function](#function)
  - [annotate](#annotate)
  - [compile](#compile)
- [TypeAlias](#typealias)
  - [AnnotateOptions](#annotateoptions)
- [Enum](#enum)
  - [AnnotateWarningCodes](#annotatewarningcodes)
  - [CompileErrorCodes](#compileerrorcodes)
- [Interface](#interface)
  - [CompileOptions](#compileoptions)
  - [SFCParseError](#sfcparseerror)
- [Class](#class)
  - [SFCAnnotateError](#sfcannotateerror)

## Function

### annotate

Annoate the Vue SFC block

**Signature:**
```typescript
declare function annotate(source: string, filepath: string, options?: AnnotateOptions): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| source | string | The source code of the Vue SFC |
| filepath | string | The file path of the Vue SFC |
| options | AnnotateOptions | The  of the annotate function |

#### Returns

 The annotated source code of the Vue SFC

### compile

Compile i18n resources

**Signature:**
```typescript
declare function compile(source: string, output: string, options?: CompileOptions): Promise<boolean>;
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


## TypeAlias

### AnnotateOptions

Annotate options of [annotate](#annotate) function

**Signature:**
```typescript
declare type AnnotateOptions = {
    type?: string;
    force?: boolean;
    attrs?: Record<string, any>;
    onWarn?: (code: number, args: Record<string, any>, block: SFCBlock) => void;
};
```


## Enum

### AnnotateWarningCodes

Annotate Warning Codes

**Signature:**
```typescript
declare const enum AnnotateWarningCodes 
```

#### Members

| Member | Value| Description |
| --- | --- | --- |
| LANG_MISMATCH_IN_ATTR_AND_CONTENT | 4 | Lang mismatch `lang` and block content |
| LANG_MISMATCH_IN_OPTION_AND_CONTENT | 3 | Lang mismatch option and block content |
| LANG_MISMATCH_IN_SRC_AND_CONTENT | 2 | Lang mismatch block `src` and block content |
| NOT_SUPPORTED_TYPE | 1 | Not supported type |

#### Remarks

The warning codes of [annotate](#annotate) function

### CompileErrorCodes

Compile Error Codes

**Signature:**
```typescript
declare const enum CompileErrorCodes 
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
interface CompileOptions 
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


### SFCParseError

Vue SFC compiler error

**Signature:**
```typescript
interface SFCParseError extends SyntaxError 
```

#### Remarks

This is the error wrapping the error that occurred in Vue SFC compiler


#### Properties

##### erorrs

The error that occurred in Vue SFC compiler

**Signature:**
```typescript
erorrs: CompilerError[];
```

##### filepath

The filepath of the source file

**Signature:**
```typescript
filepath: string;
```



## Class

### SFCAnnotateError

The Annocation error

**Signature:**
```typescript
declare class SFCAnnotateError extends Error 
```


#### Constructor

Constructor

**Signature:**
```typescript
constructor(message: string, filepath: string);
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| message | string | The error message |
| filepath | string | The filepath of the target file at annotate processing |


#### Properties

##### filepath

The filepath of the target file at annotate processing

**Signature:**
```typescript
filepath: string;
```



