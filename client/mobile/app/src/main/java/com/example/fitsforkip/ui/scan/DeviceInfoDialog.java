package com.example.fitsforkip.ui.scan;

import android.app.Dialog;
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
import android.app.AlertDialog;
import android.text.TextWatcher;
import android.text.Editable;

import com.example.fitsforkip.R;
import com.example.fitsforkip.data.model.Equipment;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DeviceInfoDialog extends Dialog {

    private Equipment equipment;
    private OnOptionsSelectedListener listener;
    private boolean isConfirmed = false; // Track if OK was pressed

    public interface OnOptionsSelectedListener {
        void onOptionsSelected(List<String> selectedOptions);
    }

    public DeviceInfoDialog(Context context, Equipment equipment, OnOptionsSelectedListener listener) {
        super(context);
        this.equipment = equipment;
        this.listener = listener;

        init();
    }

    private void init() {
        View view = LayoutInflater.from(getContext()).inflate(R.layout.dialog_device_info, null);
        setContentView(view);

        // Set data
        TextView tvIdCode = view.findViewById(R.id.tv_id_code);
        tvIdCode.setText("IdCode: " + equipment.getQrcode());

        TextView tvDayChuyen = view.findViewById(R.id.tv_day_chuyen);
        tvDayChuyen.setText("Dây chuyền: " + equipment.getLineName());

        TextView tvCongDoan = view.findViewById(R.id.tv_cong_doan);
        tvCongDoan.setText("Công đoạn: " + equipment.getStageName());

        // Search EditText
        EditText etSearch = view.findViewById(R.id.et_search);
        etSearch.setVisibility(View.GONE); // Initially hidden

        // Options list
        ListView listOptions = view.findViewById(R.id.list_options);
        //List<String> options = new ArrayList<>(Arrays.asList("Phế phẩm", "Vệ sinh đầu/cuối ca", "Đổi mã", "Cần hỗ trợ kỹ thuật"));
        // ← THÊM: Danh sách options - BỎ ĐI "Vệ sinh đầu/cuối ca" và "Đổi mã"
        List<String> options = new ArrayList<>(java.util.Arrays.asList(
                "Phế phẩm",
                "Cần hỗ trợ kỹ thuật"
        ));
        // Add issues from equipment
        if (equipment.getIssue() != null && !equipment.getIssue().trim().isEmpty()) {
            String[] issueArray = equipment.getIssue().split(";");
            for (String issue : issueArray) {
                options.add(issue.trim());
            }
        }
        OptionAdapter adapter = new OptionAdapter(options);
        listOptions.setAdapter(adapter);

        // Icons
        ImageButton btnSearch = view.findViewById(R.id.btn_search);
        btnSearch.setOnClickListener(v -> {
            // Toggle search visibility
            if (etSearch.getVisibility() == View.VISIBLE) {
                etSearch.setVisibility(View.GONE);
                etSearch.setText("");
            } else {
                etSearch.setVisibility(View.VISIBLE);
                etSearch.requestFocus();
            }
        });

        ImageButton btnPlus = view.findViewById(R.id.btn_plus);
        btnPlus.setOnClickListener(v -> {
            // Handle plus - add new option
            AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
            builder.setTitle("Thêm tùy chọn mới");
            final EditText input = new EditText(getContext());
            input.setHint("Nhập vấn đề mới");
            builder.setView(input);
            builder.setPositiveButton("Thêm", (dialog, which) -> {
                String newOption = input.getText().toString().trim();
                if (!newOption.isEmpty()) {
                    adapter.addOption(newOption, true);
                }
            });
            builder.setNegativeButton("Hủy", null);
            builder.show();
        });

        // Search functionality
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
            // ← SỬA: Bấm "Đóng" → gọi callback với ArrayList<>() để báo hủy
            isConfirmed = false;
            if (listener != null) {
                listener.onOptionsSelected(new ArrayList<>());
            }
            dismiss();
        });

//        Button btnOk = view.findViewById(R.id.btn_ok);
//        btnOk.setOnClickListener(v -> {
//            // Handle OK - show selected options
//            List<String> selected = adapter.getSelectedOptions();
//            if (!selected.isEmpty()) {
//                isConfirmed = true; // ← THÊM: Đánh dấu OK được bấm
//                listener.onOptionsSelected(selected);
//                dismiss();
//            } else {
//                Toast.makeText(getContext(), "Không có tùy chọn nào được chọn", Toast.LENGTH_SHORT).show();
//            }
//        });

        Button btnOk = view.findViewById(R.id.btn_ok);
        btnOk.setOnClickListener(v -> {
            // Handle OK - show selected options (cho phép rỗng, giống logic handleSpecialQRCode)
            List<String> selected = adapter.getSelectedOptions();
            isConfirmed = true; // ← SỬA: Luôn đánh dấu OK được bấm, cho dù rỗng
            listener.onOptionsSelected(selected); // ← SỬA: Gửi callback ngay, dù selected rỗng
            dismiss();
        });

        // ← THÊM: Handle khi dialog bị đóng (bấm X hoặc back)
        setOnDismissListener(dialog -> {
            if (!isConfirmed && listener != null) {
                // Nếu chưa confirm, gọi callback với ArrayList<>()
                listener.onOptionsSelected(new ArrayList<>());
            }
        });

        setCancelable(true); // ← ĐỔI: Cho phép cancel để bấm X
    }

    private class OptionAdapter extends BaseAdapter implements Filterable {
        private List<String> originalOptions;
        private List<String> filteredOptions;
        private List<Boolean> checkedStates;
        private List<Boolean> enabledStates;

        //private final List<String> MAIN_OPTIONS = Arrays.asList(
        //        "Phế phẩm",
        //        "Vệ sinh đầu/cuối ca",
        //        "Đổi mã",
        //        "Cần hỗ trợ kỹ thuật"
        //);
        // ← THÊM: Chỉ 2 main options (BỎ "Vệ sinh đầu/cuối ca" và "Đổi mã")
        private final List<String> MAIN_OPTIONS = java.util.Arrays.asList(
                "Phế phẩm",
                "Cần hỗ trợ kỹ thuật"
        );

        public OptionAdapter(List<String> options) {
            this.originalOptions = new ArrayList<>(options);
            this.filteredOptions = new ArrayList<>(options);
            this.checkedStates = new ArrayList<>();
            this.enabledStates = new ArrayList<>();
            for (int i = 0; i < options.size(); i++) {
                checkedStates.add(false);
                enabledStates.add(true);
            }
        }

        @Override
        public int getCount() {
            return filteredOptions.size();
        }

        @Override
        public Object getItem(int position) {
            return filteredOptions.get(position);
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

            String option = filteredOptions.get(position);
            tvOption.setText(option);

            int originalIndex = originalOptions.indexOf(option);
            if (originalIndex != -1) {
                cbOption.setChecked(checkedStates.get(originalIndex));

                boolean isEnabled = enabledStates.get(originalIndex);
                cbOption.setEnabled(isEnabled);
                tvOption.setEnabled(isEnabled);

                if (!isEnabled) {
                    tvOption.setAlpha(0.5f);
                    cbOption.setAlpha(0.5f);
                } else {
                    tvOption.setAlpha(1.0f);
                    cbOption.setAlpha(1.0f);
                }
            }

            cbOption.setOnCheckedChangeListener((buttonView, isChecked) -> {
                int origIndex = originalOptions.indexOf(option);
                if (origIndex != -1) {
                    checkedStates.set(origIndex, isChecked);

                    if (isChecked && MAIN_OPTIONS.contains(originalOptions.get(origIndex))) {
                        disableOtherMainOptions(origIndex);
                    } else if (!isChecked) {
                        boolean hasMainOptionSelected = false;
                        for (int i = 0; i < originalOptions.size(); i++) {
                            if (checkedStates.get(i) && MAIN_OPTIONS.contains(originalOptions.get(i))) {
                                hasMainOptionSelected = true;
                                break;
                            }
                        }
                        if (!hasMainOptionSelected) {
                            enableAllOptions();
                        }
                    }
                    notifyDataSetChanged();
                }
            });

            return convertView;
        }

        private void disableOtherMainOptions(int selectedIndex) {
            for (int i = 0; i < originalOptions.size(); i++) {
                String option = originalOptions.get(i);
                if (MAIN_OPTIONS.contains(option) && i != selectedIndex) {
                    enabledStates.set(i, false);
                }
            }
        }

        private void enableAllOptions() {
            for (int i = 0; i < enabledStates.size(); i++) {
                enabledStates.set(i, true);
            }
        }

        @Override
        public Filter getFilter() {
            return new Filter() {
                @Override
                protected FilterResults performFiltering(CharSequence constraint) {
                    FilterResults results = new FilterResults();
                    List<String> filtered = new ArrayList<>();
                    if (constraint == null || constraint.length() == 0) {
                        filtered.addAll(originalOptions);
                    } else {
                        String filterPattern = constraint.toString().toLowerCase().trim();
                        for (String option : originalOptions) {
                            if (option.toLowerCase().contains(filterPattern)) {
                                filtered.add(option);
                            }
                        }
                    }
                    results.values = filtered;
                    results.count = filtered.size();
                    return results;
                }

                @Override
                protected void publishResults(CharSequence constraint, FilterResults results) {
                    filteredOptions.clear();
                    filteredOptions.addAll((List<String>) results.values);
                    notifyDataSetChanged();
                }
            };
        }

        public List<String> getSelectedOptions() {
            List<String> selected = new ArrayList<>();
            for (int i = 0; i < originalOptions.size(); i++) {
                if (checkedStates.get(i)) {
                    selected.add(originalOptions.get(i));
                }
            }
            return selected;
        }

        public void addOption(String option, boolean isChecked) {
            originalOptions.add(option);
            filteredOptions.add(option);
            checkedStates.add(isChecked);
            enabledStates.add(true);
            notifyDataSetChanged();
        }
    }
}