const fs = require('fs');
const { execSync } = require('child_process');

console.log('Book Collection System - Installer\n');

async function install() {
    try {
        // Clean up
        console.log('Cleaning up files...');
        try {
            if (fs.existsSync('node_modules')) {
                fs.rmSync('node_modules', { recursive: true, force: true });
            }
            if (fs.existsSync('package-lock.json')) {
                fs.unlinkSync('package-lock.json');
            }
            console.log('Cleanup completed!\n');
        } catch (e) {
            console.log('Cleanup skipped\n');
        }

        // Set registry
        console.log('Setting npm registry...');
        try {
            execSync('npm config set registry https://registry.npmmirror.com', { stdio: 'inherit' });
            execSync('npm config set fetch-timeout 120000', { stdio: 'inherit' });
            console.log('Registry configured!\n');
        } catch (e) {
            console.log('Registry config failed, continuing...\n');
        }

        // Install in batches
        console.log('Installing core dependencies...');
        const core = [
            'react@18.2.0',
            'react-dom@18.2.0', 
            'vite@5.2.0',
            'typescript@5.2.2'
        ];
        execSync(`npm install ${core.join(' ')}`, { stdio: 'inherit' });

        console.log('\nInstalling dev dependencies...');
        const devDeps = [
            '@types/react@18.2.66',
            '@types/react-dom@18.2.22',
            '@vitejs/plugin-react@4.2.1'
        ];
        execSync(`npm install -D ${devDeps.join(' ')}`, { stdio: 'inherit' });

        console.log('\nInstalling UI components...');
        execSync('npm install tdesign-react@1.12.0 tdesign-icons-react@0.5.0', { stdio: 'inherit' });

        console.log('\nInstalling remaining dependencies...');
        const remaining = [
            'react-router-dom@6.26.2',
            '@supabase/supabase-js@2.39.0',
            'tailwindcss@3.4.17',
            'postcss@8.5.0',
            'autoprefixer@10.4.20',
            'less@4.3.0'
        ];
        execSync(`npm install ${remaining.join(' ')}`, { stdio: 'inherit' });

        console.log('\n✅ Installation completed successfully!');
        
        // Check for .env file
        if (!fs.existsSync('.env')) {
            console.log('\n⚠️  Warning: .env file not found');
            console.log('Please copy .env.example to .env and configure Supabase settings');
        }

        console.log('\n🚀 Starting development server...');
        console.log('Server will be available at: http://localhost:5173');
        console.log('Press Ctrl+C to stop the server\n');

        execSync('npm run dev', { stdio: 'inherit' });

    } catch (error) {
        console.error('\n❌ Installation failed:', error.message);
        console.log('\nTry running these commands manually:');
        console.log('1. npm config set registry https://registry.npmmirror.com');
        console.log('2. npm install react@18.2.0 react-dom@18.2.0 vite@5.2.0');
        console.log('3. npm install tdesign-react@1.12.0 tdesign-icons-react@0.5.0');
        console.log('4. npm install @supabase/supabase-js@2.39.0 react-router-dom@6.26.2');
        process.exit(1);
    }
}

install();