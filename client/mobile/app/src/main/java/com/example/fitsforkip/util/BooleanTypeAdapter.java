// BooleanTypeAdapter
package com.example.fitsforkip.util;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;

public class BooleanTypeAdapter extends TypeAdapter<Boolean> {
    @Override
    public void write(JsonWriter out, Boolean value) throws IOException {
        if (value == null) {
            out.nullValue();
        } else {
            out.value(value);
        }
    }

    @Override
    public Boolean read(JsonReader in) throws IOException {
        switch (in.peek()) {
            case BOOLEAN:
                return in.nextBoolean();
            case NUMBER:
                int number = in.nextInt();
                return number != 0; // Ánh xạ 1 -> true, 0 -> false
            case NULL:
                in.nextNull();
                return null;
            default:
                throw new IOException("Expected a boolean or number but was " + in.peek());
        }
    }
}