# 🔧 Troubleshooting Setup - Progresta

## Common Issues & Solutions

### 1. **Prisma Validation Error**
```
Invalid prisma.user.findUnique() invocation:
{ where: { id: "xxx" } }
```

**Cause**: Schema mismatch between Prisma client and database

**Solution**:
```bash
# Stop development server
npm run dev (Ctrl+C)

# Push schema to database
npx prisma db push

# Generate new Prisma client
npx prisma generate

# Restart development server
npm run dev
```

### 2. **EPERM: Operation Not Permitted (Windows)**
```
EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp'
```

**Cause**: Windows file permission issue with Prisma client generation

**Solution**:
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Reinstall dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 3. **Database Connection Error**
```
Can't reach database server at `postgres.xxx:5432`
```

**Cause**: Database connection configuration issue

**Solution**:
1. Check `.env` file configuration:
```env
DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
DIRECT_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
```

2. Verify Supabase project is running
3. Check network connectivity

### 4. **Missing Tables/Columns Error**
```
Table 'divisions' doesn't exist in the current database
```

**Cause**: Database schema not created or outdated

**Solution**:
```bash
# Apply schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed
```

### 5. **Module Not Found Error**
```
Cannot find module '@/lib/cache'
```

**Cause**: Missing imports or incorrect file paths

**Solution**:
1. Check if file exists at the specified path
2. Verify import statements are correct
3. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### 6. **Build/Compilation Errors**
```
Type error: Property 'division' does not exist on type 'User'
```

**Cause**: TypeScript types not updated after schema changes

**Solution**:
```bash
# Generate updated Prisma client with types
npx prisma generate

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart development server
npm run dev
```

## 🚀 Quick Setup Commands

### Fresh Installation
```bash
# 1. Install dependencies
npm install

# 2. Setup database schema
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. Seed database with sample data
npm run db:seed

# 5. Start development server
npm run dev
```

### Reset Everything (Nuclear Option)
```bash
# Stop all processes
taskkill /f /im node.exe

# Remove generated files
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next

# Reinstall
npm install

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Seed with fresh data
npm run db:seed

# Start server
npm run dev
```

## 🔍 Debugging Tips

### Check Database Schema
```bash
# Open Prisma Studio to inspect database
npx prisma studio
```

### Verify Environment Variables
```bash
# Check if .env is loaded correctly
node -e "console.log(process.env.DATABASE_URL)"
```

### Check Server Logs
```bash
# View detailed server logs
npm run dev
# Look for specific error messages in console
```

### Validate Prisma Schema
```bash
# Check schema syntax
npx prisma validate

# Format schema file
npx prisma format
```

## 📋 Health Check Checklist

Before reporting issues, verify:

- [ ] `.env` file exists and has correct values
- [ ] Database is accessible (try `npx prisma db pull`)
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Schema is applied to database (`npx prisma db push`)
- [ ] Sample data exists (`npm run db:seed`)
- [ ] No TypeScript errors in IDE
- [ ] Development server starts without errors

## 🆘 Getting Help

If issues persist:

1. **Check Error Logs**: Look for specific error messages
2. **Verify Environment**: Ensure all environment variables are set
3. **Database Status**: Check Supabase dashboard for database status
4. **Clean Install**: Try the "Reset Everything" steps above
5. **Documentation**: Review setup guides in `/docs` folder

## 📞 Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| P1001 | Can't reach database | Check DATABASE_URL |
| P2002 | Unique constraint violation | Check for duplicate data |
| P2025 | Record not found | Verify data exists |
| EPERM | Permission denied | Restart as administrator |
| MODULE_NOT_FOUND | Missing dependency | Run `npm install` |

---

**Setup completed successfully! 🎉**

Your Progresta application should now be running at `http://localhost:3000`