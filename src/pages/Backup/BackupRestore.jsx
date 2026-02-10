import React from 'react';
import BackupRestoreComponent from '../../components/admin/BackupRestore';
import Layout from '../../components/Layout/Layout';

const BackupRestore = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BackupRestoreComponent />
      </div>
    </Layout>
  );
};

export default BackupRestore;