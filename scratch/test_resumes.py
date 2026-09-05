import os
import glob
import requests
import json

def test_all_resumes():
    files = glob.glob('assets/Resumes/*.pdf')
    print(f"Found {len(files)} resumes in assets/Resumes/\n")
    
    for f in files:
        fname = os.path.basename(f)
        with open(f, 'rb') as pdf_file:
            res = requests.post('http://127.0.0.1:8000/api/resume/parse', files={'file': pdf_file}).json()
            
        rdata = res.get('resume_data', {})
        ats_before = res['ats_breakdown']['total_score']
        prob_before = res['prediction']['placed_probability']
        
        # Upgrade CV simulation: add technical skills depth, missing certification, internship, and project polish
        rdata_upgraded = json.loads(json.dumps(rdata))
        current_skills = rdata_upgraded.get('skills_technical', [])
        new_skills = list(dict.fromkeys(current_skills + ['React', 'Node.js', 'Python', 'FastAPI', 'MongoDB', 'Docker', 'Git', 'REST APIs', 'SQL']))
        rdata_upgraded['skills_technical'] = new_skills
        
        certs = rdata_upgraded.get('certifications', [])
        if len(certs) < 2:
            rdata_upgraded['certifications'] = certs + [{'name': 'Full-Stack Software Engineering & Cloud Certification', 'issuer': 'Coursera / Meta', 'date': '2024'}]
            
        exp = rdata_upgraded.get('experience', [])
        if len(exp) == 0:
            rdata_upgraded['experience'] = [{'role': 'Software Development Engineering Intern', 'organization': 'Tech Solutions', 'period': '2024', 'description': 'Full stack engineering'}]
            
        projects = rdata_upgraded.get('projects', [])
        if len(projects) < 2:
            projects.append({'title': 'AI Cloud Web App', 'tech_stack': 'React, Python, Docker', 'description': 'Full stack AI project'})
        rdata_upgraded['projects'] = projects
            
        res_up = requests.post('http://127.0.0.1:8000/api/resume/build', json={'resume_data': rdata_upgraded}).json()
        ats_after = res_up['ats_breakdown']['total_score']
        prob_after = res_up['prediction']['placed_probability']
        
        print("==========================================")
        print(f"File: {fname}")
        print(f"Name: {rdata.get('full_name', 'N/A')}")
        print(f"Academics -> CGPA: {res['full_features'].get('cgpa')}/10.0 | 10th: {res['full_features'].get('tenth_percentage')}% | 12th: {res['full_features'].get('twelfth_percentage')}%")
        print(f"Extracted -> Projects: {len(rdata.get('projects', []))}, Experience: {len(rdata.get('experience', []))}, Tech Skills: {len(current_skills)}")
        print(f"BEFORE Upgrade -> ATS Score: {ats_before}/100 | Placement Odds: {prob_before*100:.1f}%")
        print(f"AFTER Upgrade  -> ATS Score: {ats_after}/100 | Placement Odds: {prob_after*100:.1f}%")
        print(f"DELTA          -> ATS Score: +{ats_after - ats_before} pts | Placement Odds: {prob_after*100 - prob_before*100:+.1f}%\n")

if __name__ == '__main__':
    test_all_resumes()
