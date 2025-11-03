package com.example.fitsforkip.data.local;

import androidx.room.Database;
import androidx.room.RoomDatabase;

@Database(entities = {IncidentHistoryEntity.class}, version = 1, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {
    public abstract IncidentHistoryDao incidentHistoryDao();
}
