package com.example.fitsforkip.ui.scan;

import android.app.Dialog;
import android.app.AlertDialog;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import android.text.TextWatcher;
import android.text.Editable;

import com.example.fitsforkip.R;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SpecialQRInfoDialog extends Dialog {

    private String qrCode;
    private String lineName;
    private String type;
    private OnConfirmListener listener;
    private boolean isConfirmed = false;

    // CHANGED: Added 'boolean confirmed' parameter to distinguish OK vs Close/Dismiss
    public interface OnConfirmListener {
        void onConfirm(List<String> selectedIssues, boolean confirmed);
    }

    public SpecialQRInfoDialog(Context context, String qrCode, String lineName, String type, OnConfirmListener listener) {
        super(context);
        this.qrCode = qrCode;
        this.lineName = lineName;
        this.type = type;
        this.listener = listener;

        init();
    }

    private void init() {
        View view = LayoutInflater.from(getContext()).inflate(R.layout.dialog_special_qr_info, null);
        setContentView(view);

        // ← THÊM: Cập nhật title dựa vào type
        TextView tvDialogTitle = view.findViewById(R.id.tv_dialog_title);
        if (type.equals("Vệ sinh đầu/cuối ca")) {
            tvDialogTitle.setText("Chọn hạng mục đầu/cuối ca:");
        } else if (type.equals("Đổi mã")) {
            tvDialogTitle.setText("Chọn hạng mục đổi mã:");
        }

        // Hiển thị dây chuyền
        TextView tvDayChuyen = view.findViewById(R.id.tv_day_chuyen);
        tvDayChuyen.setText("Dây chuyền: " + lineName);

        // ← THÊM: Search EditText
        EditText etSearch = view.findViewById(R.id.et_search);
        //etSearch.setVisibility(View.VISIBLE); // Hiển thị ngay từ đầu
        etSearch.setVisibility(View.GONE); // Initially hidden

        // ← THÊM: Issues ListView for each type
        ListView listOptions = view.findViewById(R.id.list_options);
        IssueAdapter adapter; // Declare adapter here to make it accessible outside the if-else blocks
        // Vệ sinh đầu cuối/ca
        if (type.equals("Vệ sinh đầu/cuối ca")) {
            List<String> issues = new ArrayList<>(Arrays.asList(
                    "Vệ sinh máy móc",
                    "Vệ sinh khu vực làm việc",
                    "Bật/Tắt máy đầu/cuối ca"
            ));
            adapter = new IssueAdapter(issues);
            listOptions.setAdapter(adapter);
        } else if (type.equals("Đổi mã")) {
            List<String> issues = new ArrayList<>(Arrays.asList(
                    "Dừng đổi mã"
                    //"Đổi mã do thay đổi thiết kế",
                    //"Đổi mã do yêu cầu khách hàng"
            ));
            adapter = new IssueAdapter(issues);
            listOptions.setAdapter(adapter);
        } else {
            // Default case if type doesn't match, initialize with empty list
            adapter = new IssueAdapter(new ArrayList<>());
            listOptions.setAdapter(adapter);
        }

        // ← THÊM: Search button
        ImageButton btnSearch = view.findViewById(R.id.btn_search);
        btnSearch.setOnClickListener(v -> {
            if (etSearch.getVisibility() == View.VISIBLE) {
                etSearch.setVisibility(View.GONE);
                etSearch.setText("");
                adapter.getFilter().filter("");
            } else {
                etSearch.setVisibility(View.VISIBLE);
                etSearch.requestFocus();
            }
        });

        // ← THÊM: Plus button (thêm vấn đề mới)
        ImageButton btnPlus = view.findViewById(R.id.btn_plus);
        btnPlus.setOnClickListener(v -> {
            AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
            builder.setTitle("Thêm hạng mục mới");
            final EditText input = new EditText(getContext());
            input.setHint("Nhập hạng mục");
            builder.setView(input);
            builder.setPositiveButton("Thêm", (dialog, which) -> {
                String newIssue = input.getText().toString().trim();
                if (!newIssue.isEmpty()) {
                    adapter.addIssue(newIssue, true);
                }
            });
            builder.setNegativeButton("Hủy", null);
            builder.show();
        });

        // ← THÊM: Search functionality
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                adapter.getFilter().filter(s);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Buttons
        Button btnClose = view.findViewById(R.id.btn_close);
        btnClose.setOnClickListener(v -> {
            isConfirmed = false;
            dismiss();
        });

        Button btnOk = view.findViewById(R.id.btn_ok);
        btnOk.setOnClickListener(v -> {
            List<String> selectedIssues = adapter.getSelectedIssues();
            isConfirmed = true;
            // CHANGED: Pass 'true' for confirmed when OK is clicked
            if (listener != null) {
                listener.onConfirm(selectedIssues, true);
            }
            dismiss();
        });

        // CHANGED: Pass 'false' for confirmed when dialog is dismissed (e.g., Close or back)
        setOnDismissListener(dialog -> {
            if (!isConfirmed && listener != null) {
                listener.onConfirm(new ArrayList<>(), false);
            }
        });

        setCancelable(true);
    }

    private class IssueAdapter extends BaseAdapter implements Filterable {
        private List<String> originalIssues;
        private List<String> filteredIssues;
        private List<Boolean> checkedStates;

        public IssueAdapter(List<String> issues) {
            this.originalIssues = new ArrayList<>(issues);
            this.filteredIssues = new ArrayList<>(issues);
            this.checkedStates = new ArrayList<>();
            for (int i = 0; i < issues.size(); i++) {
                checkedStates.add(false);
            }
        }

        @Override
        public int getCount() {
            return filteredIssues.size();
        }

        @Override
        public Object getItem(int position) {
            return filteredIssues.get(position);
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.list_item_option, parent, false);
            }

            TextView tvOption = convertView.findViewById(R.id.tv_option);
            CheckBox cbOption = convertView.findViewById(R.id.cb_option);

            String issue = filteredIssues.get(position);
            tvOption.setText(issue);

            int originalIndex = originalIssues.indexOf(issue);
            if (originalIndex != -1) {
                cbOption.setChecked(checkedStates.get(originalIndex));
            }

            cbOption.setOnCheckedChangeListener((buttonView, isChecked) -> {
                int origIndex = originalIssues.indexOf(issue);
                if (origIndex != -1) {
                    checkedStates.set(origIndex, isChecked);
                }
            });

            return convertView;
        }

        @Override
        public Filter getFilter() {
            return new Filter() {
                @Override
                protected FilterResults performFiltering(CharSequence constraint) {
                    FilterResults results = new FilterResults();
                    List<String> filtered = new ArrayList<>();
                    if (constraint == null || constraint.length() == 0) {
                        filtered.addAll(originalIssues);
                    } else {
                        String filterPattern = constraint.toString().toLowerCase().trim();
                        for (String issue : originalIssues) {
                            if (issue.toLowerCase().contains(filterPattern)) {
                                filtered.add(issue);
                            }
                        }
                    }
                    results.values = filtered;
                    results.count = filtered.size();
                    return results;
                }

                @Override
                protected void publishResults(CharSequence constraint, FilterResults results) {
                    filteredIssues.clear();
                    filteredIssues.addAll((List<String>) results.values);
                    notifyDataSetChanged();
                }
            };
        }

        public List<String> getSelectedIssues() {
            List<String> selected = new ArrayList<>();
            for (int i = 0; i < originalIssues.size(); i++) {
                if (checkedStates.get(i)) {
                    selected.add(originalIssues.get(i));
                }
            }
            return selected;
        }

        public void addIssue(String issue, boolean isChecked) {
            originalIssues.add(issue);
            filteredIssues.add(issue);
            checkedStates.add(isChecked);
            notifyDataSetChanged();
        }
    }
}
