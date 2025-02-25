"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DiffTool() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState<string[][]>([]);

  const handleCompare = () => {
    const result = calculateDiff(text1, text2);
    setDiffResult(result);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-primary">Diff Tool</h1>
        <p className="text-muted-foreground">Compare text effortlessly</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          placeholder="Enter text here..."
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          className="min-h-[200px] resize-y"
        />
        <Textarea
          placeholder="Enter text here..."
          value={text2}
          onChange={(e) => setText2(e.target.value)}
          className="min-h-[200px] resize-y"
        />
      </div>

      <div className="flex justify-center">
        <Button onClick={handleCompare} size="lg">
          Compare
        </Button>
      </div>

      {diffResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diff Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <pre className="font-mono text-sm">
                {diffResult.map((line, index) => (
                  <div key={index}>
                    {line.map((part, partIndex) => {
                      let className = "";
                      if (part.startsWith("+"))
                        className = "bg-green-100 text-green-800";
                      else if (part.startsWith("-"))
                        className = "bg-red-100 text-red-800";
                      else className = "text-muted-foreground";

                      return (
                        <span key={partIndex} className={className}>
                          {part}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4">
        <Button variant="outline" disabled>
          Save to Cloud
        </Button>
        <Button variant="link" disabled>
          Version History
        </Button>
      </div>
    </div>
  );
}

function calculateDiff(text1: string, text2: string): string[][] {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const result: string[][] = [];

  let i = 0;
  let j = 0;

  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      result.push([`+ ${lines2[j]}`]);
      j++;
    } else if (j >= lines2.length) {
      result.push([`- ${lines1[i]}`]);
      i++;
    } else if (lines1[i] === lines2[j]) {
      result.push([`  ${lines1[i]}`]);
      i++;
      j++;
    } else {
      result.push([`- ${lines1[i]}`, `+ ${lines2[j]}`]);
      i++;
      j++;
    }
  }

  return result;
}
