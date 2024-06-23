import { GeneralLayout } from "~/components/general-layout";
import { Authenticated } from "@refinedev/core";
import { useState } from "react";
import JsonSchemaTable from "~/components/json-table-editor";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

export default function AdminUI() {

    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "outside": {
                "type": "object",
                "properties": {
                    "deep1": {
                        "type": "object",
                        "properties": {
                            "deep2": {
                                "type": "object",
                                "properties": {
                                    "deep3": {
                                        "type": "string"
                                    }
                                },
                                "required": ["deep3"]
                            },
                            "deep4": {
                                "type": "number"
                            }
                        },
                        "required": ["deep2", "deep4"]
                    },
                    "deep5": {
                        "type": "boolean"
                    },
                    "deep6": {
                        "type": "object",
                        "properties": {
                            "deep7": {
                                "type": "object",
                                "properties": {
                                    "deep8": {
                                        "type": "string"
                                    }
                                },
                                "required": ["deep8"]
                            },
                            "deep9": {
                                "type": "number"
                            }
                        },
                        "required": ["deep7", "deep9"]
                    }
                },
                "required": ["deep1", "deep5", "deep6"]
            },
            "property2": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "property3": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            },
            "property4": {
                "type": "array",
                "items": {
                    "type": "boolean"
                }
            },
            "property5": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "property6": {
                "type": "string"
            },
            "property7": {
                "type": "number"
            },
            "property8": {
                "type": "boolean"
            },
            "property9": {
                "type": "string",
                "enum": ["one", "two", "three"]
            },
            "property10": {
                "type": "array",
                "items": {
                    "anyOf": [
                        { "type": "string" },
                        { "type": "number" },
                        { "type": "boolean" },
                        { "type": "string", "enum": ["one", "two", "three"] }
                    ]
                }
            }
        },
        "required": ["outside", "property2", "property3", "property4", "property5", "property6", "property7", "property8", "property9", "property10"]
    };

    const hiddenFields = ["property5", "property4", "outside.deep1.deep2"];

    const [data, setData] = useState<Record<string, any>>({
        "outside": {
            "deep1": {
                "deep2": {
                    "deep3": "ut"
                },
                "deep4": 333
            },
            "deep5": true,
            "deep6": {
                "deep7": {
                    "deep8": "officia consectetur nostrud velit ad"
                },
                "deep9": 3739
            }
        },
        "property2": [
            "aliqua do in nostrud adipisicing",
            "fugiat ipsum adipisicing ut amet",
            "qui dolor magna sed in",
            "Excepteur",
            "in irure in"
        ],
        "property3": [
            -32701,
            -4918,
            61084,
            -27335,
            -29126
        ],
        "property4": [
            true
        ],
        "property5": [
            "pariatur ea",
            "Ut elit incididunt",
            "magna in quis",
            "pariatur consectetur officia anim"
        ],
        "property6": "Ut irure",
        "property7": -132,
        "property8": true,
        "property9": "three",
        "property10": [
            "three"
        ]
    });

    const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));
    const [jsonError, setJsonError] = useState('');

    const handleDataChange = (newData: Record<string, any>) => {
        setData(newData);
        setJsonText(JSON.stringify(newData, null, 2));
        console.log('Updated data:', newData);
    };

    const handleJsonTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonText(event.target.value);
        setJsonError('');
    };

    const applyJsonChanges = () => {
        try {
            const parsedData = JSON.parse(jsonText);
            setData(parsedData);
            setJsonError('');
        } catch (error) {
            setJsonError('Invalid JSON: ' + (error as Error).message);
        }
    };

    return (
        <Authenticated key="dashboard">
            <GeneralLayout>
                <div className="p-4 space-y-6">
                    <h1 className="text-2xl font-bold">Admin UI</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Table View</h2>
                            <JsonSchemaTable
                                schema={schema}
                                initialData={data}
                                hiddenFields={hiddenFields}
                                onDataChange={handleDataChange}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2">JSON View</h2>
                            <Textarea
                                value={jsonText}
                                onChange={handleJsonTextChange}
                                className="font-mono h-64 mb-2"
                            />
                            {jsonError && <p className="text-red-500 mb-2">{jsonError}</p>}
                            <Button onClick={applyJsonChanges}>Apply JSON Changes</Button>
                        </div>
                    </div>
                </div>
            </GeneralLayout>
        </Authenticated>
    );
}


