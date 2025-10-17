package com.example.fitsforkip.ui.incident;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.fitsforkip.R;
import com.example.fitsforkip.data.model.IncidentHistory;

import java.util.List;

public class IncidentHistoryAdapter extends RecyclerView.Adapter<IncidentHistoryAdapter.IncidentViewHolder> {

    private List<IncidentHistory> incidentList;
    private OnDeleteClickListener onDeleteClickListener;

    public interface OnDeleteClickListener {
        void onDelete(int position);
    }

    public IncidentHistoryAdapter(List<IncidentHistory> incidentList, OnDeleteClickListener onDeleteClickListener) {
        this.incidentList = incidentList;
        this.onDeleteClickListener = onDeleteClickListener;
    }

    @NonNull
    @Override
    public IncidentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_incident_history, parent, false);
        return new IncidentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull IncidentViewHolder holder, int position) {
        IncidentHistory incident = incidentList.get(position);
        //holder.tvQrCode.setText(incident.getQrCode());
        holder.tvEquipmentCode.setText(incident.getEquipmentCode());
        holder.tvEquipmentName.setText(incident.getEquipmentName());
        holder.tvStage.setText(incident.getStage());
        holder.tvLine.setText(incident.getLine());
        holder.tvIssue.setText(incident.getIssue());
        holder.tvStartTime.setText(incident.getStartTime());
        holder.tvEndTime.setText(incident.getEndTime());
        holder.tvDuration.setText(incident.getDuration());
        holder.tvIssueType.setText(incident.getIssueType());
        holder.tvSynced.setText(incident.isSynced() ? "Đã đồng bộ" : "Chưa đồng bộ");
        holder.tvSynced.setTextColor(incident.isSynced() ? holder.itemView.getContext().getColor(R.color.primary_color) : holder.itemView.getContext().getColor(android.R.color.holo_red_dark));

        holder.btnDelete.setOnClickListener(v -> onDeleteClickListener.onDelete(position));
    }

    @Override
    public int getItemCount() {
        return incidentList.size();
    }

    static class IncidentViewHolder extends RecyclerView.ViewHolder {
        TextView tvQrCode, tvEquipmentCode, tvEquipmentName, tvStage, tvLine, tvIssue, tvStartTime, tvEndTime, tvDuration, tvIssueType, tvSynced;
        ImageButton btnDelete;

        public IncidentViewHolder(@NonNull View itemView) {
            super(itemView);
            //tvQrCode = itemView.findViewById(R.id.tv_qr_code);
            tvEquipmentCode = itemView.findViewById(R.id.tv_equipment_code);
            tvEquipmentName = itemView.findViewById(R.id.tv_equipment_name);
            tvStage = itemView.findViewById(R.id.tv_stage);
            tvLine = itemView.findViewById(R.id.tv_line);
            tvIssue = itemView.findViewById(R.id.tv_issue);
            tvStartTime = itemView.findViewById(R.id.tv_start_time);
            tvEndTime = itemView.findViewById(R.id.tv_end_time);
            tvDuration = itemView.findViewById(R.id.tv_duration);
            tvIssueType = itemView.findViewById(R.id.tv_issue_type);
            tvSynced = itemView.findViewById(R.id.tv_synced);
            btnDelete = itemView.findViewById(R.id.btn_delete);
        }
    }
}
