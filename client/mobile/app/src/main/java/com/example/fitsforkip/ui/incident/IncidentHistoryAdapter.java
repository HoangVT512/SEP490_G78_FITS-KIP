package com.example.fitsforkip.ui.incident;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.fitsforkip.R;
import com.example.fitsforkip.data.local.IncidentHistoryEntity;
import com.example.fitsforkip.data.model.Equipment;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class IncidentHistoryAdapter extends RecyclerView.Adapter<IncidentHistoryAdapter.IncidentViewHolder> {

    private List<IncidentHistoryEntity> incidentList;
    private List<String> lineList;
    private List<Equipment> equipmentList;
    private OnDeleteClickListener onDeleteClickListener;

    public interface OnDeleteClickListener {
        void onDelete(IncidentHistoryEntity entity);
    }

//    public IncidentHistoryAdapter(List<IncidentHistoryEntity> incidentList, List<Equipment> equipmentList, OnDeleteClickListener onDeleteClickListener) {
//        this.incidentList = incidentList;
//        this.equipmentList = equipmentList;
//        this.onDeleteClickListener = onDeleteClickListener;
//    }

    public IncidentHistoryAdapter(List<IncidentHistoryEntity> incidentList, List<Equipment> equipmentList, List<String> lineList, OnDeleteClickListener onDeleteClickListener) {
        this.incidentList = incidentList;
        this.equipmentList = equipmentList;
        this.lineList = lineList;
        this.onDeleteClickListener = onDeleteClickListener;
    }

    @NonNull
    @Override
    public IncidentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_incident_history, parent, false);
        return new IncidentViewHolder(view);
    }

//    @Override
//    public void onBindViewHolder(@NonNull IncidentViewHolder holder, int position) {
//        IncidentHistoryEntity incident = incidentList.get(position);
//        holder.tvEquipmentCode.setText(String.valueOf(incident.getEquipmentId()));
//
//        // Find equipment details
//        Equipment eq = null;
//        if (equipmentList != null) {
//            for (Equipment e : equipmentList) {
//                if (incident.getEquipmentId() != null && e.getEquipmentId() == incident.getEquipmentId()) {
//                    eq = e;
//                    break;
//                }
//            }
//        }
//        if (eq != null) {
//            holder.tvEquipmentCode.setText(eq.getEquipmentCode()); // Display equipment code instead of ID
//            holder.tvEquipmentName.setText(eq.getEquipmentName());
//            holder.tvStage.setText(eq.getStageName());
//            holder.tvLine.setText(eq.getLineName());
//        } else {
//            holder.tvEquipmentCode.setText("N/A");
//            holder.tvEquipmentName.setText("");
//            holder.tvStage.setText("");
//            holder.tvLine.setText("");
//        }
//
//        // Show small tech support icon next to equipment code if needed
//        if (incident.isTechSupport()) {
//            holder.ivTechSupportSmall.setVisibility(View.VISIBLE);
//            holder.tvTechSupportLabelSmall.setVisibility(View.VISIBLE);
//        } else {
//            holder.ivTechSupportSmall.setVisibility(View.GONE);
//            holder.tvTechSupportLabelSmall.setVisibility(View.GONE);
//        }
//
//        holder.tvIssue.setText(incident.getIssue() != null ? incident.getIssue() : "");
//        holder.tvStartTime.setText(incident.getStartTime() != null ? new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(incident.getStartTime()) : "");
//        holder.tvEndTime.setText(incident.getEndTime() != null ? new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(incident.getEndTime()) : "");
//        holder.tvDuration.setText(incident.getDuration() != null ? String.format("%.2f phút", incident.getDuration()) : "");
//        // Map typeId to type name
//        String typeName = getTypeName(incident.getTypeId());
//        holder.tvIssueType.setText(typeName);
//
//        holder.tvSynced.setText(incident.isSynced() ? "Đã đồng bộ" : "Chưa đồng bộ");
//        holder.tvSynced.setTextColor(incident.isSynced() ? holder.itemView.getContext().getColor(android.R.color.holo_green_dark) : holder.itemView.getContext().getColor(android.R.color.holo_red_dark));
//
//        // Show tech support icon and label if isTechSupport is true
////        if (incident.isTechSupport()) {
////            holder.ivTechSupport.setVisibility(View.VISIBLE);
////            holder.tvTechSupportLabel.setVisibility(View.VISIBLE);
////        } else {
////            holder.ivTechSupport.setVisibility(View.GONE);
////            holder.tvTechSupportLabel.setVisibility(View.GONE);
////        }
//
//        // Show images if available
//        List<String> imageUrls = incident.getImageUrls();
//        List<String> imagePaths = incident.getImagePaths();
//        List<String> imagesToShow = incident.isSynced() ? imageUrls : imagePaths;
//        if (imagesToShow != null && !imagesToShow.isEmpty()) {
//            holder.llImages.setVisibility(View.VISIBLE);
//            holder.llImageContainer.removeAllViews();
//            for (String image : imagesToShow) {
//                ImageView imageView = new ImageView(holder.itemView.getContext());
//                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(100, 100);
//                params.setMargins(4, 4, 4, 4);
//                imageView.setLayoutParams(params);
//                imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
//                if (incident.isSynced()) {
//                    // Load from URL
//                    Glide.with(holder.itemView.getContext())
//                            .load(image)
//                            .placeholder(R.drawable.ic_placeholder_image)
//                            .error(R.drawable.ic_error)
//                            .into(imageView);
//                } else {
//                    // Load from local file
//                    Glide.with(holder.itemView.getContext())
//                            .load(new java.io.File(image))
//                            .placeholder(R.drawable.ic_placeholder_image)
//                            .error(R.drawable.ic_error)
//                            .into(imageView);
//                }
//                holder.llImageContainer.addView(imageView);
//            }
//        } else {
//            holder.llImages.setVisibility(View.GONE);
//        }
//
//        holder.btnDelete.setOnClickListener(v -> onDeleteClickListener.onDelete(position));
//    }


    @Override
    public void onBindViewHolder(@NonNull IncidentViewHolder holder, int position) {
        IncidentHistoryEntity incident = incidentList.get(position);

        // === ẨN/HIỆN TOÀN BỘ 3 TRƯỜNG ===
        if (incident.getEquipmentId() == null) {
            // Ẩn toàn bộ 3 dòng Mã TB, Tên TB, Công đoạn
            holder.llEquipmentCode.setVisibility(View.GONE);
            holder.llEquipmentName.setVisibility(View.GONE);
            holder.llStage.setVisibility(View.GONE);

            // Hiển thị dây chuyền
            String lineName = lineList != null && !lineList.isEmpty() ? lineList.get(0) : "N/A";
            holder.tvLine.setText("Dây chuyền: " + lineName);
            holder.tvLine.setVisibility(View.VISIBLE);

            // Ẩn tech support
            holder.ivTechSupportSmall.setVisibility(View.GONE);
            holder.tvTechSupportLabelSmall.setVisibility(View.GONE);

        } else {
            // Hiện toàn bộ
            holder.llEquipmentCode.setVisibility(View.VISIBLE);
            holder.llEquipmentName.setVisibility(View.VISIBLE);
            holder.llStage.setVisibility(View.VISIBLE);
            holder.tvLine.setVisibility(View.VISIBLE);

            // Điền dữ liệu thiết bị
            Equipment eq = findEquipmentById(incident.getEquipmentId());
            if (eq != null) {
                holder.tvEquipmentCode.setText(eq.getEquipmentCode());
                holder.tvEquipmentName.setText(eq.getEquipmentName());
                holder.tvStage.setText(eq.getStageName());
                holder.tvLine.setText(eq.getLineName());
            } else {
                holder.tvEquipmentCode.setText("N/A");
                holder.tvEquipmentName.setText("");
                holder.tvStage.setText("");
                holder.tvLine.setText("");
            }

            // Tech support
            if (incident.isTechSupport()) {
                holder.ivTechSupportSmall.setVisibility(View.VISIBLE);
                holder.tvTechSupportLabelSmall.setVisibility(View.VISIBLE);
            } else {
                holder.ivTechSupportSmall.setVisibility(View.GONE);
                holder.tvTechSupportLabelSmall.setVisibility(View.GONE);
            }
        }

        // === CÁC TRƯỜNG KHÁC (giữ nguyên hoặc thêm tiền tố) ===
        holder.tvIssue.setText((incident.getIssue() != null ? incident.getIssue() : ""));
        holder.tvStartTime.setText(formatTime(incident.getStartTime()));
        holder.tvEndTime.setText(formatTime(incident.getEndTime()));
        holder.tvDuration.setText((incident.getDuration() != null ? String.format("%.2f phút", incident.getDuration()) : ""));

        String typeName = getTypeName(incident.getTypeId() != null ? incident.getTypeId() : -1);
        holder.tvIssueType.setText(typeName);

        //holder.tvSynced.setText("Đồng bộ: " + (incident.isSynced() ? "Đã đồng bộ" : "Chưa đồng bộ"));
        holder.tvSynced.setText(incident.isSynced() ? "Đã đồng bộ" : "Chưa đồng bộ");
        holder.tvSynced.setTextColor(incident.isSynced()
                ? holder.itemView.getContext().getColor(android.R.color.holo_green_dark)
                : holder.itemView.getContext().getColor(android.R.color.holo_red_dark));

        // === HÌNH ẢNH ===
        List<String> imagesToShow = incident.isSynced() ? incident.getImageUrls() : incident.getImagePaths();
        if (imagesToShow != null && !imagesToShow.isEmpty()) {
            holder.llImages.setVisibility(View.VISIBLE);
            holder.llImageContainer.removeAllViews();
            for (String img : imagesToShow) {
                ImageView iv = new ImageView(holder.itemView.getContext());
                iv.setLayoutParams(new LinearLayout.LayoutParams(100, 100));
                ((LinearLayout.LayoutParams) iv.getLayoutParams()).setMargins(4, 4, 4, 4);
                iv.setScaleType(ImageView.ScaleType.CENTER_CROP);
                Glide.with(holder.itemView.getContext())
                        .load(incident.isSynced() ? img : new java.io.File(img))
                        .placeholder(R.drawable.ic_placeholder_image)
                        .error(R.drawable.ic_error)
                        .into(iv);
                holder.llImageContainer.addView(iv);
            }
        } else {
            holder.llImages.setVisibility(View.GONE);
        }

        holder.btnDelete.setOnClickListener(v -> onDeleteClickListener.onDelete(incident));
    }

    private Equipment findEquipmentById(Integer equipmentId) {
        if (equipmentId == null || equipmentList == null) return null;
        for (Equipment e : equipmentList) {
            if (e.getEquipmentId() == equipmentId) return e;
        }
        return null;
    }

    private String formatTime(Date date) {
        return date != null ? new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(date) : "";
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

    public void setLineList(List<String> lineList) {
        this.lineList = lineList;
        notifyDataSetChanged();
    }

    private String getTypeName(int typeId) {
        switch (typeId) {
            case 1: return "Dừng ngắn";
            case 2: return "Dừng dài";
            case 3: return "Phế phẩm";
            case 4: return "Vệ sinh đầu/cuối ca";
            case 5: return "Đổi mã";
            default: return "Chưa xác định";
        }
    }

    static class IncidentViewHolder extends RecyclerView.ViewHolder {
        TextView tvEquipmentCode, tvEquipmentName, tvStage, tvLine, tvIssue, tvStartTime, tvEndTime, tvDuration, tvIssueType, tvSynced;
                //tvTechSupportLabel;
        ImageButton btnDelete;
        ImageView ivTechSupportSmall;
        //ivTechSupport
        LinearLayout llImages, llImageContainer, llEquipmentCode, llEquipmentName, llStage;
        TextView tvTechSupportLabelSmall;

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
            //ivTechSupport = itemView.findViewById(R.id.iv_tech_support);
            ivTechSupportSmall = itemView.findViewById(R.id.iv_tech_support_small);
            //tvTechSupportLabel = itemView.findViewById(R.id.tv_tech_support_label);
            tvTechSupportLabelSmall = itemView.findViewById(R.id.tv_tech_support_label_small);
            llImages = itemView.findViewById(R.id.ll_images);
            llImageContainer = itemView.findViewById(R.id.ll_image_container);
            llEquipmentCode = itemView.findViewById(R.id.ll_equipment_code);
            llEquipmentName = itemView.findViewById(R.id.ll_equipment_name);
            llStage = itemView.findViewById(R.id.ll_stage);
        }
    }
}
