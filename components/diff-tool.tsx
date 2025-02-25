"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightIcon, ArrowBottomLeftIcon } from "@radix-ui/react-icons";

export default function DiffTool() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState<{
    lines: Array<{
      lineNumber: number;
      originalText: string;
      newText: string;
      status: "unchanged" | "modified" | "added" | "removed";
    }>;
  }>({ lines: [] });

  useEffect(() => {
    const result = calculateLineDiff(text1, text2);
    setDiffResult(result);
  }, [text1, text2]);

  const handleRevertLine = (lineIndex: number) => {
    const line = diffResult.lines[lineIndex];

    if (line.status === "unchanged") return;

    if (line.status === "added") {
      const newLines = text2.split("\n");
      newLines.splice(line.lineNumber, 1);
      setText2(newLines.join("\n"));
      return;
    }

    const newLines = text2.split("\n");

    if (line.status === "removed") {
      newLines.splice(line.lineNumber, 0, line.originalText);
    } else {
      newLines[line.lineNumber] = line.originalText;
    }

    setText2(newLines.join("\n"));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-primary">
          Online Text Diff Tool
        </h1>
        <p className="text-muted-foreground">
          Compare text with line-by-line revert options
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          placeholder="Enter original text here..."
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          className="min-h-[200px] resize-y font-mono text-sm"
        />
        <Textarea
          placeholder="Enter modified text here..."
          value={text2}
          onChange={(e) => setText2(e.target.value)}
          className="min-h-[200px] resize-y font-mono text-sm"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Live Diff Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="font-mono text-sm">
              {diffResult.lines.map((line, index) => (
                <div
                  key={index}
                  className="flex items-stretch border-b border-gray-100"
                >
                  {/* Line number */}
                  <div className="flex-none w-12 bg-gray-50 text-gray-500 text-right pr-2 py-1">
                    {line.lineNumber + 1}
                  </div>

                  {/* Original text */}
                  <div
                    className={`flex-1 py-1 px-2 ${
                      line.status === "removed"
                        ? "bg-red-50"
                        : line.status === "modified"
                        ? "bg-red-50"
                        : ""
                    }`}
                  >
                    {line.originalText}
                  </div>

                  {/* Revert button */}
                  <div className="flex-none w-8 flex items-center justify-center bg-gray-50">
                    {line.status !== "unchanged" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRevertLine(index)}
                        title="Revert this change"
                      >
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* New text */}
                  <div
                    className={`flex-1 py-1 px-2 ${
                      line.status === "added"
                        ? "bg-green-50"
                        : line.status === "modified"
                        ? "bg-green-50"
                        : ""
                    }`}
                  >
                    {line.newText}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setText2(text1)}
          className="flex items-center"
        >
          <ArrowBottomLeftIcon className="mr-2 h-4 w-4" />
          Revert All Changes
        </Button>
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

function calculateLineDiff(original: string, modified: string) {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  const result: {
    lines: Array<{
      lineNumber: number;
      originalText: string;
      newText: string;
      status: "unchanged" | "modified" | "added" | "removed";
    }>;
  } = { lines: [] };

  let i = 0;
  let j = 0;

  while (i < originalLines.length || j < modifiedLines.length) {
    if (i >= originalLines.length) {
      result.lines.push({
        lineNumber: j,
        originalText: "",
        newText: modifiedLines[j],
        status: "added",
      });
      j++;
    } else if (j >= modifiedLines.length) {
      result.lines.push({
        lineNumber: i,
        originalText: originalLines[i],
        newText: "",
        status: "removed",
      });
      i++;
    } else if (originalLines[i] === modifiedLines[j]) {
      result.lines.push({
        lineNumber: i,
        originalText: originalLines[i],
        newText: modifiedLines[j],
        status: "unchanged",
      });
      i++;
      j++;
    } else {
      const origInMod = modifiedLines.indexOf(originalLines[i], j);

      const modInOrig = originalLines.indexOf(modifiedLines[j], i);

      if (modInOrig === -1 && origInMod === -1) {
        result.lines.push({
          lineNumber: j,
          originalText: originalLines[i],
          newText: modifiedLines[j],
          status: "modified",
        });
        i++;
        j++;
      } else if (
        origInMod !== -1 &&
        (modInOrig === -1 || origInMod < modInOrig)
      ) {
        result.lines.push({
          lineNumber: j,
          originalText: "",
          newText: modifiedLines[j],
          status: "added",
        });
        j++;
      } else {
        result.lines.push({
          lineNumber: i,
          originalText: originalLines[i],
          newText: "",
          status: "removed",
        });
        i++;
      }
    }
  }

  return result;
}
