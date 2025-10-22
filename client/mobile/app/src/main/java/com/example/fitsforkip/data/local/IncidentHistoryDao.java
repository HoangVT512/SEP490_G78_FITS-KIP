package com.example.fitsforkip.data.local;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import java.util.List;

@Dao
public interface IncidentHistoryDao {
    @Insert
    long insert(IncidentHistoryEntity incident);

    @Query("SELECT * FROM incident_history ORDER BY createdDate DESC")
    List<IncidentHistoryEntity> getAllIncidents();

    @Query("SELECT * FROM incident_history WHERE synced = 0")
    List<IncidentHistoryEntity> getUnsyncedIncidents();

    @Update
    void update(IncidentHistoryEntity incident);

    @Query("DELETE FROM incident_history WHERE incidentId = :id")
    void deleteById(int id);

    @Query("SELECT COUNT(*) FROM incident_history WHERE synced = 0")
    int getUnsyncedCount();

    @Query("DELETE FROM incident_history")
    void deleteAll();

    @Query("SELECT COUNT(*) FROM incident_history WHERE synced = 0 AND equipmentId IN (:equipmentIds)")
    int getUnsyncedCountByEquipmentIds(List<Integer> equipmentIds);

    @Query("SELECT * FROM incident_history WHERE synced = 0 AND equipmentId IN (:equipmentIds) ORDER BY createdDate DESC")
    List<IncidentHistoryEntity> getUnsyncedIncidentsByEquipmentIds(List<Integer> equipmentIds);

    @Query("DELETE FROM incident_history WHERE synced = 0 AND equipmentId IN (:equipmentIds)")
    void deleteAllUnsyncedByEquipmentIds(List<Integer> equipmentIds);
}
