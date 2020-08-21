# Merge recursive

def merge_recursively(a, b)
    if a.is_a?(Hash)
        a.merge(b) {|key, a_item, b_item| merge_recursively(a_item, b_item) }
    else
        b
    end
end