package com.example.fitsforkip.data.local;

import android.content.Context;
import androidx.room.Room;

public class AppDatabaseSingleton {
    private static AppDatabase instance;

    public static synchronized AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(),
                    AppDatabase.class, "fitsforkip.db")
                    .fallbackToDestructiveMigration()
                    .build();
        }
        return instance;
    }
}
