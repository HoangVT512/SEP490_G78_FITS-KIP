package com.example.fitsforkip.ui.equipment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.fitsforkip.R;
import com.example.fitsforkip.data.model.Equipment;
import java.util.List;

public class EquipmentAdapter extends RecyclerView.Adapter<EquipmentAdapter.EquipmentViewHolder> {

    private List<Equipment> equipmentList;

    public EquipmentAdapter(List<Equipment> equipmentList) {
        this.equipmentList = equipmentList;
    }

    @NonNull
    @Override
    public EquipmentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_equipment, parent, false);
        return new EquipmentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull EquipmentViewHolder holder, int position) {
        Equipment equipment = equipmentList.get(position);
        holder.bind(equipment);
    }

    @Override
    public int getItemCount() {
        return equipmentList.size();
    }

    static class EquipmentViewHolder extends RecyclerView.ViewHolder {
        private TextView tvCode, tvName, tvStage, tvLine, tvIssues;

        public EquipmentViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCode = itemView.findViewById(R.id.tv_equipment_code);
            tvName = itemView.findViewById(R.id.tv_equipment_name);
            tvStage = itemView.findViewById(R.id.tv_equipment_stage);
            tvLine = itemView.findViewById(R.id.tv_equipment_line);
            tvIssues = itemView.findViewById(R.id.tv_equipment_issues);
        }

        public void bind(Equipment equipment) {
            tvCode.setText("Mã TB: " + equipment.getCode());
            tvName.setText("Tên TB: " + equipment.getName());
            tvStage.setText("Công đoạn: " + equipment.getStage());
            tvLine.setText("Dây chuyền: " + equipment.getLine());

            if (equipment.getIssues().isEmpty()) {
                tvIssues.setText("Vấn đề: Không có");
            } else {
                String issuesText = "Vấn đề: " + String.join(", ", equipment.getIssues());
                tvIssues.setText(issuesText);
            }
        }
    }
}
