define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Merger {
        //down and dirty merge function I wrote
        //scans line by line attempting to merge
        static MergeContent(content1, content2) {
            let lines1 = content1.split('\n');
            let lines2 = content2.split('\n');
            let merged_content = '';
            let cursor2 = 0;
            for (let cursor1 = 0; cursor1 < lines1.length; cursor1++) {
                if (cursor2 >= lines2.length) //finished reading content2
                 {
                    merged_content += lines1[cursor1] + '\n';
                }
                else {
                    let line1 = lines1[cursor1];
                    let line2 = lines2[cursor2];
                    if (line1 == line2) {
                        merged_content += line1 + '\n';
                        cursor2++;
                    }
                    else //diff detected
                     {
                        let next_common_line = -1;
                        let lines2_merge_content = '';
                        for (let i = cursor2; i < lines2.length; i++) {
                            lines2_merge_content += lines2[i] + '\n';
                            if (line1 == lines2[i]) {
                                next_common_line = i;
                                break;
                            }
                        }
                        if (next_common_line != -1) {
                            merged_content += lines2_merge_content;
                            cursor2 = next_common_line + 1;
                        }
                        else {
                            merged_content += line1 + '\n';
                        }
                    }
                }
            }
            return merged_content;
        }
    }
    exports.Merger = Merger;
});
//# sourceMappingURL=merger.js.map