const { execSync } = require('child_process');

console.log('Continue Installation...\n');

// Install remaining packages step by step with retry
function installWithRetry(command, description, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Installing ${description}... (attempt ${i + 1}/${maxRetries})`);
            execSync(command, { stdio: 'inherit' });
            console.log(`✅ ${description} installed successfully!\n`);
            return true;
        } catch (error) {
            console.log(`❌ ${description} failed (attempt ${i + 1}/${maxRetries})`);
            if (i === maxRetries - 1) {
                console.log(`⚠️  Skipping ${description}...\n`);
                return false;
            }
            console.log('Retrying in 3 seconds...\n');
            // Wait 3 seconds before retry
            const start = Date.now();
            while (Date.now() - start < 3000) {}
        }
    }
}

async function continueInstall() {
    try {
        // Try to install remaining packages one by one
        const packages = [
            { pkg: '@types/react@18.2.66', desc: 'React types' },
            { pkg: '@types/react-dom@18.2.22', desc: 'React DOM types' },
            { pkg: '@vitejs/plugin-react@4.2.1', desc: 'Vite React plugin' },
            { pkg: 'tdesign-react@1.12.0', desc: 'TDesign UI components' },
            { pkg: 'tdesign-icons-react@0.5.0', desc: 'TDesign icons' },
            { pkg: 'react-router-dom@6.26.2', desc: 'React Router' },
            { pkg: '@supabase/supabase-js@2.39.0', desc: 'Supabase client' },
            { pkg: 'tailwindcss@3.4.17', desc: 'Tailwind CSS' },
            { pkg: 'postcss@8.5.0', desc: 'PostCSS' },
            { pkg: 'autoprefixer@10.4.20', desc: 'Autoprefixer' },
            { pkg: 'less@4.3.0', desc: 'Less preprocessor' }
        ];

        let successCount = 0;
        for (const { pkg, desc } of packages) {
            if (installWithRetry(`npm install ${pkg}`, desc)) {
                successCount++;
            }
        }

        console.log(`\n📊 Installation Summary:`);
        console.log(`✅ Successfully installed: ${successCount}/${packages.length} packages`);

        if (successCount >= packages.length * 0.8) {
            console.log('\n🎉 Installation mostly successful! You can start the project.\n');
            console.log('🚀 Starting development server...');
            console.log('Server: http://localhost:5173');
            console.log('Press Ctrl+C to stop\n');
            
            try {
                execSync('npm run dev', { stdio: 'inherit' });
            } catch (e) {
                console.log('\n❌ Failed to start dev server');
                console.log('Try running manually: npm run dev');
            }
        } else {
            console.log('\n⚠️  Too many packages failed to install');
            console.log('Please try installing the missing packages manually');
        }

    } catch (error) {
        console.error('\n❌ Continue install failed:', error.message);
    }
}

continueInstall();