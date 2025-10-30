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

    // THÊM METHOD MỚI NÀY
    @Query("UPDATE incident_history SET synced = :synced WHERE incidentId = :incidentId")
    void updateSyncedStatus(int incidentId, boolean synced);

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

    // ← THÊM QUERY MỚI NÀY: LẤY TẤT CẢ (CẢ SYNCED VÀ UNSYNCED)
    @Query("SELECT * FROM incident_history WHERE equipmentId IN (:equipmentIds) ORDER BY createdDate DESC")
    List<IncidentHistoryEntity> getAllIncidentsByEquipmentIds(List<Integer> equipmentIds);

    // ← THÊM QUERY ĐẾM TẤT CẢ
    @Query("SELECT COUNT(*) FROM incident_history WHERE equipmentId IN (:equipmentIds)")
    int getTotalCountByEquipmentIds(List<Integer> equipmentIds);

    @Query("DELETE FROM incident_history WHERE synced = 0 AND equipmentId IN (:equipmentIds)")
    void deleteAllUnsyncedByEquipmentIds(List<Integer> equipmentIds);

    @Query("SELECT * FROM incident_history WHERE lineId = :lineId ORDER BY createdDate DESC")
    List<IncidentHistoryEntity> getIncidentsByLineId(int lineId);

    @Query("SELECT COUNT(*) FROM incident_history WHERE synced = 0 AND lineId = :lineId")
    int getUnsyncedCountByLineId(int lineId);
}
