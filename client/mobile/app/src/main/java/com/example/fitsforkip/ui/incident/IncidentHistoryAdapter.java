package com.example.fitsforkip.ui.incident;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.fitsforkip.R;
import com.example.fitsforkip.data.local.IncidentHistoryEntity;
import com.example.fitsforkip.data.model.Equipment;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

public class IncidentHistoryAdapter extends RecyclerView.Adapter<IncidentHistoryAdapter.IncidentViewHolder> {

    private List<IncidentHistoryEntity> incidentList;
    private List<Equipment> equipmentList;
    private OnDeleteClickListener onDeleteClickListener;

    public interface OnDeleteClickListener {
        void onDelete(int position);
    }

    public IncidentHistoryAdapter(List<IncidentHistoryEntity> incidentList, List<Equipment> equipmentList, OnDeleteClickListener onDeleteClickListener) {
        this.incidentList = incidentList;
        this.equipmentList = equipmentList;
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
        IncidentHistoryEntity incident = incidentList.get(position);
        holder.tvEquipmentCode.setText(String.valueOf(incident.getEquipmentId()));

        // Find equipment details
        Equipment eq = null;
        if (equipmentList != null) {
            for (Equipment e : equipmentList) {
                if (e.getEquipmentId() == incident.getEquipmentId()) {
                    eq = e;
                    break;
                }
            }
        }
        if (eq != null) {
            holder.tvEquipmentCode.setText(eq.getEquipmentCode()); // Display equipment code instead of ID
            holder.tvEquipmentName.setText(eq.getEquipmentName());
            holder.tvStage.setText(eq.getStageName());
            holder.tvLine.setText(eq.getLineName());
        } else {
            holder.tvEquipmentCode.setText("N/A");
            holder.tvEquipmentName.setText("");
            holder.tvStage.setText("");
            holder.tvLine.setText("");
        }

        holder.tvIssue.setText(incident.getIssue() != null ? incident.getIssue() : "");
        holder.tvStartTime.setText(incident.getStartTime() != null ? new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(incident.getStartTime()) : "");
        holder.tvEndTime.setText(incident.getEndTime() != null ? new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(incident.getEndTime()) : "");
        holder.tvDuration.setText(incident.getDuration() != null ? String.format("%.2f phút", incident.getDuration()) : "");
        // Map typeId to type name
        String typeName = getTypeName(incident.getTypeId());
        holder.tvIssueType.setText(typeName);

        holder.tvSynced.setText(incident.isSynced() ? "Đã đồng bộ" : "Chưa đồng bộ");
        holder.tvSynced.setTextColor(incident.isSynced() ? holder.itemView.getContext().getColor(android.R.color.holo_green_dark) : holder.itemView.getContext().getColor(android.R.color.holo_red_dark));

        // Show tech support icon and label if isTechSupport is true
        if (incident.isTechSupport()) {
            holder.ivTechSupport.setVisibility(View.VISIBLE);
            holder.tvTechSupportLabel.setVisibility(View.VISIBLE);
        } else {
            holder.ivTechSupport.setVisibility(View.GONE);
            holder.tvTechSupportLabel.setVisibility(View.GONE);
        }

        holder.btnDelete.setOnClickListener(v -> onDeleteClickListener.onDelete(position));
    }

    @Override
    public int getItemCount() {
        return incidentList.size();
    }

    public void setEquipmentList(List<Equipment> equipmentList) {
        this.equipmentList = equipmentList;
        notifyDataSetChanged();
    }

    public void setIncidentList(List<IncidentHistoryEntity> incidentList) {
        this.incidentList = incidentList;
        notifyDataSetChanged();
    }

    private String getTypeName(int typeId) {
        switch (typeId) {
            case 1: return "Dùng ngắn";
            case 2: return "Dùng dài";
            case 3: return "Phế phẩm";
            case 4: return "Đổi mã";
            default: return "Chưa xác định";
        }
    }

    static class IncidentViewHolder extends RecyclerView.ViewHolder {
        TextView tvEquipmentCode, tvEquipmentName, tvStage, tvLine, tvIssue, tvStartTime, tvEndTime, tvDuration, tvIssueType, tvSynced, tvTechSupportLabel;
        ImageButton btnDelete;
        ImageView ivTechSupport;

        public IncidentViewHolder(@NonNull View itemView) {
            super(itemView);
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
            ivTechSupport = itemView.findViewById(R.id.iv_tech_support);
            tvTechSupportLabel = itemView.findViewById(R.id.tv_tech_support_label);
        }
    }
}
