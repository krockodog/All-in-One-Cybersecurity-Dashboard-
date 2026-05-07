# Troubleshooting Guide

## Common Issues & Solutions

### Pentest Execution Issues

#### Issue: "Scope validation fails"

**Symptoms**: Scope validation error when starting pentest

**Root Causes**:
- Invalid target format (malformed domain or IP)
- Authorized systems don't include all targets
- Jurisdictional restrictions blocking certain targets

**Solutions**:
1. Verify target format (valid domains, CIDR notation for networks)
2. Ensure authorized systems include all targets
3. Check jurisdictional restrictions in scope settings
4. Try with a simpler scope first

**Example Fix**:
```json
// ❌ Invalid
"targets": ["example.com", "192.168.1.0"],
"authorizedSystems": ["example.com"]

// ✅ Valid
"targets": ["example.com", "192.168.1.0/24"],
"authorizedSystems": ["example.com", "192.168.1.0/24"]
```

#### Issue: "Tool execution fails with timeout"

**Symptoms**: Tool runs but times out before completion

**Root Causes**:
- Tool taking longer than expected
- Network connectivity issues
- Target system slow to respond
- Resource constraints

**Solutions**:
1. Increase timeout value in tool parameters
2. Verify network connectivity to target
3. Check target system availability
4. Monitor resource usage (CPU, memory)
5. Try running tool in isolation

**Example Configuration**:
```typescript
// Increase timeout for slow targets
const toolParams = {
  timeout: 300000, // 5 minutes instead of default 60 seconds
  retries: 3,
  retryDelay: 5000,
};
```

#### Issue: "No findings extracted from tool output"

**Symptoms**: Tool runs successfully but no findings are extracted

**Root Causes**:
- Tool output format not recognized
- Target system is secure (no vulnerabilities found)
- Tool output parser needs update
- Tool misconfiguration

**Solutions**:
1. Verify tool ran successfully (check tool logs)
2. Manually review tool output for findings
3. Check if target system is actually vulnerable
4. Report output format issue if parser fails
5. Verify tool parameters are correct

**Debug Steps**:
```bash
# Check tool logs
tail -f .manus-logs/devserver.log | grep "tool-name"

# Verify tool output
cat /tmp/tool-output.txt

# Check parser configuration
grep -r "tool-name" server/tools/
```

### Report Generation Issues

#### Issue: "Report export times out"

**Symptoms**: Report generation starts but times out before completion

**Root Causes**:
- Large number of findings
- Complex ISO 27001 analysis
- Database query performance
- Memory constraints

**Solutions**:
1. Export in smaller chunks (by date range or severity)
2. Use simpler report format (JSON instead of PDF)
3. Optimize database queries
4. Increase timeout in export settings
5. Check available disk space

**Example**: Export by Severity
```typescript
// Export critical findings only
const exportParams = {
  severity: ['critical', 'high'],
  format: 'json', // Faster than PDF
  includeAnalysis: false, // Reduce processing
};
```

#### Issue: "PDF export fails with formatting errors"

**Symptoms**: PDF export fails or produces corrupted output

**Root Causes**:
- Special characters in findings
- Large images or attachments
- Unsupported fonts
- Memory constraints

**Solutions**:
1. Export to HTML first, then convert to PDF manually
2. Use Excel or DOCX format instead
3. Sanitize special characters in findings
4. Reduce image resolution
5. Export in smaller batches

### ISO 27001 Compliance Issues

#### Issue: "Compliance score not updating"

**Symptoms**: Compliance score remains unchanged after control updates

**Root Causes**:
- Database not synced
- Cache not cleared
- Control status not properly saved
- Browser cache issue

**Solutions**:
1. Refresh the browser page
2. Clear browser cache (Ctrl+Shift+Delete)
3. Manually trigger compliance recalculation
4. Check database connection
5. Verify control status was saved

**Manual Recalculation**:
```typescript
// Force recalculation
const recalculateCompliance = async (assessmentId: string) => {
  await trpc.iso27001.recalculateCompliance.mutate({ assessmentId });
};
```

#### Issue: "Gap analysis shows incorrect gaps"

**Symptoms**: Gap analysis identifies gaps that shouldn't exist

**Root Causes**:
- Control status not properly set
- Pentest findings not mapped correctly
- Gap analysis logic error
- Stale data

**Solutions**:
1. Verify control status is set to "Implemented"
2. Check pentest finding mapping
3. Run gap analysis again
4. Clear cache and retry
5. Contact support if issue persists

### Performance Issues

#### Issue: "Dashboard loads slowly"

**Symptoms**: Dashboard takes long time to load or feels sluggish

**Root Causes**:
- Large number of findings
- Slow database queries
- Network latency
- Browser performance issues

**Solutions**:
1. Clear browser cache
2. Check network connection
3. Reduce number of findings displayed
4. Use simpler dashboard view
5. Check browser console for errors

**Performance Optimization**:
```typescript
// Use pagination for large result sets
const { data } = await trpc.pentest.getFindings.useQuery({
  limit: 50,
  offset: 0,
  sort: 'severity',
});
```

#### Issue: "Tool execution is very slow"

**Symptoms**: Individual tools take much longer than expected

**Root Causes**:
- Target system slow to respond
- Network latency
- Tool misconfiguration
- Resource constraints

**Solutions**:
1. Check network connectivity
2. Verify target system is responsive
3. Review tool parameters
4. Monitor resource usage
5. Try with a smaller target scope

### Authentication & Authorization Issues

#### Issue: "Login fails with OAuth error"

**Symptoms**: OAuth login fails with error message

**Root Causes**:
- OAuth configuration incorrect
- Session cookie issue
- Browser privacy settings
- OAuth provider down

**Solutions**:
1. Check OAuth configuration in environment variables
2. Clear browser cookies and try again
3. Disable browser privacy settings temporarily
4. Try incognito/private browsing mode
5. Check OAuth provider status

**Verify OAuth Configuration**:
```bash
# Check environment variables
echo $VITE_OAUTH_PORTAL_URL
echo $VITE_APP_ID
echo $OAUTH_SERVER_URL
```

#### Issue: "Permission denied for operation"

**Symptoms**: Operation fails with permission error

**Root Causes**:
- User role insufficient
- Resource ownership mismatch
- Session expired
- Authorization cache issue

**Solutions**:
1. Verify user role (admin vs user)
2. Check resource ownership
3. Log out and log back in
4. Clear authorization cache
5. Contact administrator if needed

### Database Issues

#### Issue: "Database connection fails"

**Symptoms**: Error connecting to database

**Root Causes**:
- Database server down
- Connection string incorrect
- Network connectivity issue
- Firewall blocking connection

**Solutions**:
1. Verify database server is running
2. Check connection string in environment
3. Verify network connectivity
4. Check firewall rules
5. Verify database credentials

**Test Database Connection**:
```bash
# Test MySQL connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1"

# Check connection string format
echo $DATABASE_URL
```

#### Issue: "Database query times out"

**Symptoms**: Database queries fail with timeout error

**Root Causes**:
- Query is too complex
- Missing database indexes
- Database server overloaded
- Network latency

**Solutions**:
1. Optimize query (add indexes, simplify)
2. Increase query timeout
3. Check database server performance
4. Reduce result set size
5. Contact database administrator

### File Storage Issues

#### Issue: "File upload fails"

**Symptoms**: File upload fails with error

**Root Causes**:
- S3 bucket not accessible
- File size too large
- Invalid file format
- Credentials incorrect

**Solutions**:
1. Verify S3 bucket is accessible
2. Check file size limit
3. Verify file format is allowed
4. Check S3 credentials
5. Check network connectivity

**Check S3 Configuration**:
```bash
# Verify S3 bucket exists
aws s3 ls s3://your-bucket-name

# Check S3 credentials
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

#### Issue: "Downloaded file is corrupted"

**Symptoms**: Downloaded file cannot be opened

**Root Causes**:
- File transfer interrupted
- File encoding issue
- Corrupted file in S3
- Browser download issue

**Solutions**:
1. Try downloading again
2. Use different browser
3. Verify file size matches
4. Check file format
5. Try downloading from S3 directly

### Development & Debugging

#### Issue: "Build fails with TypeScript errors"

**Symptoms**: `npm run build` fails with TypeScript errors

**Root Causes**:
- Type mismatch
- Missing type definitions
- Incompatible library versions
- Code syntax error

**Solutions**:
1. Read error message carefully
2. Fix type mismatches
3. Install missing type definitions
4. Update library versions
5. Check code syntax

**Debug Build**:
```bash
# Run TypeScript check
npx tsc --noEmit

# Run build with verbose output
npm run build -- --debug
```

#### Issue: "Tests fail after changes"

**Symptoms**: `npm run test` shows test failures

**Root Causes**:
- Code changes broke tests
- Test setup issue
- Timing issue
- Mock data outdated

**Solutions**:
1. Read test error message
2. Review code changes
3. Update test mocks if needed
4. Check test setup
5. Run single test for debugging

**Debug Tests**:
```bash
# Run single test file
npx vitest server/auth.logout.test.ts

# Run tests with verbose output
npm run test -- --reporter=verbose

# Watch mode for development
npx vitest --watch
```

### Getting Help

If you can't resolve an issue:

1. **Check Logs**: Review `.manus-logs/` directory for error details
2. **Read Documentation**: Check README.md, PENTEST_GUIDE.md, ISO27001_GUIDE.md
3. **Search Issues**: Check GitHub issues for similar problems
4. **Contact Support**: Email support@cybersecurity-dashboard.com with:
   - Error message and stack trace
   - Steps to reproduce
   - Environment details (OS, browser, versions)
   - Relevant logs from `.manus-logs/`

---

**Need Help? We're Here to Support You! 🤝**
