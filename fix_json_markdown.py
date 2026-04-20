import json
import re

def fix_json_content(filepath):
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON in {filepath}: {e}")
        return

    modified = False

    def process_string(s):
        nonlocal modified
        original = s

        # 1. Replace literal escaped newlines '\\n' with actual newlines '\n'
        # This is mainly for experience.json which seems to have \\n
        if '\\n' in s:
             s = s.replace('\\n', '\n')

        # 2. Ensure lists start with a double newline
        # Search for pattern: (non-newline char) followed by single newline followed by (digit. or - or *) followed by space
        # e.g., "text.\n1. Item" -> "text.\n\n1. Item"
        # We need to look for \n that is NOT preceded by \n

        # Regex explanation:
        # (?<!\n)  : Negative lookbehind to ensure not already preceded by \n
        # \n       : The newline we found
        # (?=\d+\.|-|\*) : Positive lookahead for list start (1. or - or *)

        # However, Python's re module doesn't support variable-width lookbehind easily for all cases,
        # but here we just want to ensure we turn \n into \n\n if it's a list start.

        # Let's try a simpler approach:
        # Find "\n" followed by a list marker, and replace with "\n\n"
        # But we must be careful not to replace "\n\n" with "\n\n\n".

        # Pattern: Newline, optional whitespace, list marker
        # We want to replace single newline with double if it starts a list.

        # First, let's normalize: if we see multiple newlines, keep them?
        # If we see ".\n1.", we want ".\n\n1."

        # Strategy:
        # 1. Replace all double newlines with a placeholder (e.g., <DOUBLE_NEWLINE>)
        # 2. Replace single newlines followed by list marker with <DOUBLE_NEWLINE> + list marker
        # 3. Restore placeholders to \n\n

        # Actually, simpler:
        # Just look for [^\n]\n(\d+\.|-|\*) and replace with \1\n\n\2

        # Regex: ([^\n])\n(\s*(?:-|\*|\d+\.)\s)
        # Replacement: \1\n\n\2

        new_s = re.sub(r'([^\n])\n(\s*(?:-|\*|\d+\.)\s)', r'\1\n\n\2', s)

        # Also handle the case where it might be just \n without preceding char (start of string? unlikely for description)

        if new_s != original:
            modified = True
            return new_s

        if s != original: # Case where only \\n -> \n happened
            modified = True
            return s

        return original

    def traverse(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, str):
                    # Only modify description fields or similar long text
                    if k in ['long_description', 'solution_delivered', 'problem_statement']:
                        obj[k] = process_string(v)
                elif isinstance(v, (dict, list)):
                    traverse(v)
        elif isinstance(obj, list):
            for item in obj:
                traverse(item)

    traverse(data)

    if modified:
        print(f"Modifying {filepath}...")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    else:
        print(f"No changes needed for {filepath}.")

if __name__ == "__main__":
    fix_json_content('json_data/projects.json')
    fix_json_content('json_data/experience.json')
