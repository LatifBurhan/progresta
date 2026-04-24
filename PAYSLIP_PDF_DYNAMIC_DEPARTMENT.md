# Payslip PDF - Dynamic Department Branding

## Overview
Updated payslip PDF generation to display department-specific logo, company name, and address based on the employee's department.

## Problem
Previously, all payslip PDFs showed:
- Fixed logo: `alwustho.png`
- Fixed company name: "Alwustho Technologies"
- Fixed address: Gang Melom No. 15, Waringinrejo, Cemani, Grogol, Sukoharjo

This was incorrect for employees from UFUK HIJAU ENERGY and ELFAN ACADEMY departments.

## Solution
Made the PDF header dynamic based on employee's department from `user_departments` table.

## Department Configuration

### ALWUSTHO
- **Logo**: `public/master-alwustho.png`
- **Company Name**: Alwustho Technologies
- **Address**: Jl. Semenromo, Gg. Melon Jl. Waringinrejo No.15, Ngruki, Cemani, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552

### UFUK HIJAU ENERGY
- **Logo**: `public/master-ufuk.png`
- **Company Name**: Ufuk Hijau Energy
- **Address**: Jl. Puntodewo No.53, Cemani, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552

### ELFAN ACADEMY
- **Logo**: `public/master-elfan.png`
- **Company Name**: Elfan Academy
- **Address**: CR76+MMC Jalan Semen Romo Cemani, Gg. Melon Jl. Waringinrejo No.15, Ngruki, Cemani, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552

## Implementation Details

### File Modified
`app/api/payslips/[id]/pdf/route.ts`

### Changes Made

1. **Added Department Configuration**
   ```typescript
   const DEPARTMENT_CONFIG: Record<string, DepartmentInfo> = {
     'ALWUSTHO': { name, address, logoFile },
     'UFUK HIJAU ENERGY': { name, address, logoFile },
     'ELFAN ACADEMY': { name, address, logoFile }
   }
   ```

2. **Updated Logo Loading Function**
   - Changed from `getLogoBase64()` to `getLogoBase64(logoFileName: string)`
   - Now accepts logo filename as parameter
   - Loads logo from `public/` directory dynamically

3. **Added Department Info Helper**
   - `getDepartmentInfo(departmentName)` function
   - Case-insensitive matching
   - Falls back to ALWUSTHO if department not found

4. **Fetch Employee Department**
   - Query `user_departments` table to get employee's department
   - Join with `departments` table to get department name
   - Use department name to lookup configuration

5. **Dynamic PDF Header**
   - Logo source: `${logoSrc}` (from department config)
   - Company name: `${deptInfo.name}` (from department config)
   - Address: `${deptInfo.address}` (from department config)

## How It Works

1. User requests payslip PDF: `/api/payslips/{id}/pdf`
2. System fetches payslip data
3. System fetches employee's department from `user_departments` table
4. System looks up department configuration (logo, name, address)
5. System loads appropriate logo file from `public/` directory
6. System generates HTML with dynamic header
7. PDF displays with correct branding

## Fallback Behavior

If employee has no department assigned:
- Defaults to ALWUSTHO branding
- Logo: `master-alwustho.png`
- Name: "Alwustho Technologies"
- Address: ALWUSTHO address

If department name doesn't match any configuration:
- Case-insensitive matching attempted
- If still no match, defaults to ALWUSTHO

## Logo Requirements

All logo files must be placed in `public/` directory:
- ✅ `public/master-alwustho.png`
- ✅ `public/master-ufuk.png`
- ✅ `public/master-elfan.png`

Logo files are:
- Read from filesystem
- Encoded to base64
- Embedded directly in HTML as data URI
- No external image requests needed

## Testing

### Test Case 1: ALWUSTHO Employee
1. Create payslip for employee from ALWUSTHO department
2. Download PDF
3. **Expected**:
   - Logo: ALWUSTHO logo (top right)
   - Company Name: "Alwustho Technologies"
   - Address: ALWUSTHO address

### Test Case 2: UFUK Employee
1. Create payslip for employee from UFUK HIJAU ENERGY department
2. Download PDF
3. **Expected**:
   - Logo: UFUK logo (top right)
   - Company Name: "Ufuk Hijau Energy"
   - Address: UFUK address

### Test Case 3: ELFAN Employee
1. Create payslip for employee from ELFAN ACADEMY department
2. Download PDF
3. **Expected**:
   - Logo: ELFAN logo (top right)
   - Company Name: "Elfan Academy"
   - Address: ELFAN address

### Test Case 4: Employee Without Department
1. Create payslip for employee with no department assignment
2. Download PDF
3. **Expected**:
   - Falls back to ALWUSTHO branding
   - No errors

## Database Query

The system queries:
```sql
SELECT 
  ud.department_id,
  d.name as department_name
FROM user_departments ud
JOIN departments d ON ud.department_id = d.id
WHERE ud.user_id = '{employee_id}'
```

## Benefits

1. **Accurate Branding**: Each department's payslips show correct company identity
2. **Professional**: Employees see their actual company logo and address
3. **Maintainable**: Easy to add new departments by updating `DEPARTMENT_CONFIG`
4. **Flexible**: Supports multiple departments without code duplication
5. **Robust**: Fallback to default if department not found

## Future Enhancements

Possible improvements:
- Store department branding in database instead of hardcoded
- Support custom colors per department
- Support multiple logo sizes
- Add department-specific footer text
- Support department-specific PDF styling

## Notes

- Logo files must exist in `public/` directory before deployment
- Logo encoding happens on each PDF generation (consider caching if performance issue)
- Department names in config must match database exactly (case-insensitive matching helps)
- Address text wraps automatically in PDF layout

## Status
✅ Implementation Complete
✅ No Diagnostics Errors
⏳ Ready for Testing
