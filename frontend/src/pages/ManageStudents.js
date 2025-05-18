import React, { useState, useEffect } from 'react';
import { getStudents, addWalletPoints, createStudent, updateStudent } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pointsForm, setPointsForm] = useState({
    studentId: '',
    amount: ''
  });
  const [studentForm, setStudentForm] = useState({
    _id: '',
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    isEditing: false
  });
  
  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching students for page:', page);
      const response = await getStudents({ page, limit: 10 });
      console.log('Students response:', response.data);
      
      // Ensure we have an array of students
      const studentsData = Array.isArray(response.data.users) 
        ? response.data.users 
        : (Array.isArray(response.data) ? response.data : []);
      
      console.log('Processed students data:', studentsData);
      setStudents(studentsData);
      setTotalPages(response.data.pagination?.totalPages || Math.ceil(studentsData.length / 10) || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
      setLoading(false);
      setStudents([]); // Reset students to empty array on error
    }
  };
  
  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handlePointsFormChange = (e) => {
    const { name, value } = e.target;
    setPointsForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };
  
  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };
  
  const handleAddPoints = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const pointsValue = parseFloat(pointsForm.amount);
      console.log('Adding points - raw value:', pointsForm.amount);
      console.log('Adding points - parsed value:', pointsValue);
      
      if (isNaN(pointsValue) || pointsValue <= 0) {
        setError('Points must be a positive number');
        return;
      }
      
      if (!pointsForm.studentId) {
        setError('Please select a student');
        return;
      }
      
      console.log('Adding points to user:', pointsForm.studentId, 'amount:', pointsValue);
      const response = await addWalletPoints(pointsForm.studentId, pointsValue);
      console.log('Add points response:', response);
      
      setSuccess(`Successfully added ${pointsForm.amount} points to the student's wallet.`);
      setPointsForm({ studentId: '', amount: '' });
      
      // Refresh the students list after a short delay
      setTimeout(() => {
        fetchStudents(currentPage);
      }, 500);
    } catch (error) {
      console.error('Error adding points:', error);
      setError(error.response?.data?.message || 'Failed to add points. Please try again.');
    }
  };
  
  const handleEditStudent = (student) => {
    setStudentForm({
      _id: student._id,
      name: student.name,
      email: student.email,
      password: '',
      phoneNumber: student.phoneNumber || '',
      isEditing: true
    });
  };
  
  const handleCancelEdit = () => {
    setStudentForm({
      _id: '',
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      isEditing: false
    });
  };
  
  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const formData = {
        name: studentForm.name,
        email: studentForm.email,
        phoneNumber: studentForm.phoneNumber
      };
      
      if (!studentForm.isEditing) {
        // Creating new student
        formData.password = studentForm.password;
        formData.role = 'student';
        
        console.log('Creating new student:', formData);
        try {
          const response = await createStudent(formData);
          console.log('Create student response:', response);
          setSuccess('Student created successfully');
        } catch (err) {
          console.error('Failed to create student:', err);
          console.error('Error details:', err.response?.data || err.message);
          throw err;
        }
      } else {
        // Updating existing student
        if (studentForm.password) {
          formData.password = studentForm.password;
        }
        
        if (!studentForm._id) {
          setError('Missing student ID. Please try again by selecting a student from the list.');
          return;
        }
        
        console.log('Updating student:', studentForm._id, formData);
        try {
          console.log('Calling updateStudent service with:', studentForm._id, formData);
          
          // Add loading state
          setLoading(true);
          const response = await updateStudent(studentForm._id, formData);
          setLoading(false);
          
          console.log('Update student response:', response);
          
          if (response && response.data) {
            setSuccess('Student updated successfully');
            
            // Reset form and refresh list
            handleCancelEdit();
            setTimeout(() => {
              fetchStudents(currentPage);
            }, 500);
          } else {
            setError('Update completed but received an unexpected response. Please check if the update was successful.');
          }
        } catch (err) {
          setLoading(false);
          console.error('Failed to update student:', err);
          console.error('Error details:', err.response?.data || err.message);
          
          // Show more detailed error information to help with debugging
          const errorMessage = err.response?.data?.message || err.message;
          setError(`Failed to update student: ${errorMessage}`);
          return; // Don't reset form on error
        }
        return; // Exit early since we've already handled the refresh
      }
      
      // Reset form and refresh list (only for create, update has its own handler)
      handleCancelEdit();
      setTimeout(() => {
        fetchStudents(currentPage);
      }, 500);
      
    } catch (error) {
      setLoading(false);
      console.error('Error saving student:', error);
      setError(error.response?.data?.message || 'Failed to save student. Please try again.');
    }
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading students..." />;
  }
  
  return (
    <div className="manage-students">
      <h1>Manage Students</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card">
        <h2>{studentForm.isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmitStudent}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={studentForm.name}
              onChange={handleStudentFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={studentForm.email}
              onChange={handleStudentFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {studentForm.isEditing ? 'Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={studentForm.password}
              onChange={handleStudentFormChange}
              required={!studentForm.isEditing}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              className="form-input"
              value={studentForm.phoneNumber}
              onChange={handleStudentFormChange}
            />
          </div>
          
          <div className="form-actions">
            {studentForm.isEditing && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn">
              {studentForm.isEditing ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="card">
        <h2>Add Wallet Points</h2>
        <form onSubmit={handleAddPoints}>
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">Student</label>
            <select
              id="studentId"
              name="studentId"
              className="form-input"
              value={pointsForm.studentId}
              onChange={handlePointsFormChange}
              required
            >
              <option value="">Select student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student._id})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={pointsForm.amount}
              onChange={handlePointsFormChange}
              min="1"
              step="1"
              required
            />
          </div>
          
          <button type="submit" className="btn">Add Points</button>
        </form>
      </div>
      
      <h2>Students List</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Wallet Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No students found.</td>
            </tr>
          ) : (
            students.map(student => (
              <tr key={student._id}>
                <td>{student._id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.points || 0} points</td>
                <td>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => handleEditStudent(student)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <div key={page} className="pagination-item">
              <button
                className={`pagination-link ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;