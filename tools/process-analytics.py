#!/usr/bin/python

import numpy as np
import requests
import json
import sys

def get_data(url):

  url = requests.get(url)
  data = json.loads(url.text)

  return data['rows']

def load_reference_data(file):
  with open(file, 'r') as f:
    return json.loads(f.read())

def get_ref_experiment(ref, experiment):
  for exp in ref['experiments']:
    if exp['name'] == experiment:
      return exp
  return None

def extract_variables(inp):
  values = {}
  (action, data) = inp.split('.', 1)

  pairs = data.split('&')
  for p in pairs:
    if '=' in p:
      (k,v) = p.split('=')
    elif ':' in p:
      (k,v) = p.split(':')
    else:
      continue
    values[k] = v

  return (action, values)

def compile_data(rows, ref):

  refExperiment = None
  refData = None
  refOut = None

  histo_groups = []

  for row in rows:

    # Get experiment and task
    task = row[0]
    if not '.task-' in task:
      continue
    experiment = task.split('.task-')[0]
    task = int(task.split('.task-')[1])

    # Get Action
    action = row[1]
    if not 'completed.' in action:
      continue
    action = action[10:]

    # Get metric
    (action, values) = extract_variables(row[1])

    # Get referece data only once
    if refExperiment is None:
      refExperiment = experiment

      # Extract the relevant experiment reference information
      refData = get_ref_experiment(ref, experiment)
      if not refData:
        print "ERROR: Unknown experiment %s" % experiment
        continue

      # Get output section
      refOut = refData['output']

    elif refExperiment != experiment:
      print "ERROR: Mixing experiment names (%s and %s)" % (refExperiment, experiment)
      continue

    # Get metric
    metric = refOut['metric']
    if not metric in values:
      print "ERROR: Missing metric %s on data" % metric
      continue

    # Get dependent variable value (input) and count
    out_value = float(values[metric])
    out_count = int(row[2])

    # Independant variable value (input)
    in_value = refOut['in_values'][task]

    # Get proper histogram
    histo_values = None
    for v in histo_groups:
      if v['in'] == in_value:
        histo_values = v['histogram']
    if not histo_values:
      histo_values = []
      histo_groups.append({
        'in': in_value,
        'histogram': histo_values
      })

    # Calculate histogram values
    found = False
    for v in histo_values:
      if v['x'] == out_value:
        v['y'] += out_count
        found = True
        break
    if not found:
      histo_values.append({
          'x': out_value,
          'y': out_count
        })

  # print json.dumps(histo_groups,sort_keys=True,  indent=4, separators=(',', ': '))

  # Collect histogram averages
  x_vals = []
  y_vals = []
  for g in histo_groups:
    v = g['in']

    # Calculate weighted average
    hist_x = np.array(map(lambda v: v['x'], g['histogram']))
    hist_y = np.array(map(lambda v: v['y'], g['histogram']))
    mean = np.average(hist_x, weights=hist_y)

    # Normalize value if specified
    if 'norm_range' in refOut:
      o_range = refOut['norm_range']
      if (o_range[0] < o_range[1]):
        value = np.interp(mean, o_range, [0.0, 1.0])
      else:
        value = np.interp(mean, [o_range[1], o_range[0]], [1.0, 0.0])
    else:
      value = mean

    # Collect x/y values
    x_vals.append( v )
    y_vals.append( value )

    # print "%r: (%r, %r) = %f (%f)" % (v, hist_x, hist_y, mean, value)

  for i in range(0, len(x_vals)):
    print "%r %s,%r" % (x_vals[i], refOut['units'], y_vals[i])

# Load reference data
ref = load_reference_data('../experiments/specs.json')

# Download metrics from the url given
metrics = get_data(sys.argv[1])

# Compile data
compile_data(metrics, ref)
